import {
	Controller,
	Get,
	Query,
	UseGuards,
	DefaultValuePipe,
	ParseIntPipe,
	Patch,
	Param,
	Body,
	Delete,
	Post,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
	ApiQuery,
	ApiResponse,
	ApiBody,
} from '@nestjs/swagger';
import { AdminUsersService } from './users/admin-users.service';
import { AdminBookingsService } from './bookings/admin-bookings.service';
import { AdminBookingCancellationService } from './bookings/admin-booking-cancellation.service';
import { AdminEventsService } from './events/admin-events.service';
import { AdminCategoriesService } from './categories/admin-categories.service';
import { AdminPromoCodesService } from './promo-codes/admin-promo-codes.service';
import { DashboardStatsService } from './dashboard/dashboard-stats.service';
import { DashboardFlowService } from './dashboard/dashboard-flow.service';
import { DashboardRevenueService } from './dashboard/dashboard-revenue.service';
import { DashboardSnapshotService } from './dashboard/dashboard-snapshot.service';
import { BookingStatusHistoryService } from './dashboard/booking-status-history.service';
import {
	AppException,
	Roles,
	RolesGuard,
	GetBrandHost,
	GetCurrentUserId,
	GetLocale,
	ZodValidationPipe,
	parseOptionalQueryInt,
	parseOptionalQueryBoolean,
	parseOptionalQueryDate,
} from '@shared';
import type { Locale } from '@prisma/client';
import { AccessTokenGuard } from '@modules/auth/guards/access-token.guard';
import { RateLimiterService } from '@infra/rate-limiter/rate-limiter.service';
import {
	BookingAuthorSchema,
	BookingDisplayStatusEnum,
	PaymentMethodEnum,
	EventStatusEnum,
	EventDifficultyEnum,
	UserRoleSchema,
	TimeFilterSchema,
	SpotsFilterSchema,
	ConfirmBookingManuallySchema,
	CreateManualBookingSchema,
	CreateCategorySchema,
	UpdateCategorySchema,
	CreatePromoCodeSchema,
	UpdatePromoCodeSchema,
	AdminCancelBookingSchema,
	CompensateBookingSchema,
	TransferBookingSchema,
	ChangeQuantitySchema,
	QuantityQuoteRequestSchema,
} from '@event-space/shared';
import { ADMIN_CONFIG } from '@event-space/shared/constants';
import { AppErrorCode } from '@event-space/shared';
import type {
	BookingAuthor,
	BookingDisplayStatus,
	EventDifficulty,
	EventStatus,
	UpdateShadowUserData,
	UserRoleType,
	TimeFilterType,
	SpotsFilterType,
	ConfirmBookingManuallyData,
	CreateManualBookingData,
	CreateCategoryData,
	UpdateCategoryData,
	CreatePromoCodeData,
	UpdatePromoCodeData,
	AdminCancelBookingData,
	CompensateBookingData,
	TransferBookingData,
	ChangeQuantityData,
	QuantityQuoteRequest,
	PaymentMethod,
} from '@event-space/shared';
import { BookingService } from '@modules/booking/booking.service';
import { UpdateShadowUserSchema } from '@event-space/shared';
import { getReference } from '@infra/swagger/swagger.utils';
import { EventService } from '@modules/event/event.service';

const MAX_REVENUE_RANGE_DAYS = 366;

function assertRevenueRange(from: string, to: string): void {
	const days = (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000;

	if (days < 0 || days >= MAX_REVENUE_RANGE_DAYS) {
		throw new AppException(AppErrorCode.INVALID_QUERY_PARAM, { field: 'to' });
	}
}

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
	constructor(
		private readonly dashboardStatsService: DashboardStatsService,
		private readonly usersService: AdminUsersService,
		private readonly bookingsAdminService: AdminBookingsService,
		private readonly bookingCancellationService: AdminBookingCancellationService,
		private readonly eventsAdminService: AdminEventsService,
		private readonly categoriesService: AdminCategoriesService,
		private readonly promoCodesService: AdminPromoCodesService,
		private readonly dashboardFlowService: DashboardFlowService,
		private readonly dashboardRevenueService: DashboardRevenueService,
		private readonly dashboardSnapshotService: DashboardSnapshotService,
		private readonly bookingStatusHistoryService: BookingStatusHistoryService,
		private readonly bookingService: BookingService,
		private readonly eventService: EventService,
		private readonly rateLimiter: RateLimiterService,
	) {}

	@Get('stats')
	@ApiOperation({ summary: 'Get dashboard statistics' })
	async getDashboardStats() {
		return this.dashboardStatsService.getStats();
	}

	@Get('stats/flow')
	@ApiOperation({
		summary: 'Bookings and revenue per day over a period, with previous-period totals',
	})
	@ApiQuery({ name: 'from', required: true, description: 'YYYY-MM-DD' })
	@ApiQuery({ name: 'to', required: true, description: 'YYYY-MM-DD' })
	async getDashboardFlow(@Query('from') fromRaw: string, @Query('to') toRaw: string) {
		const from = parseOptionalQueryDate(fromRaw, 'from');
		const to = parseOptionalQueryDate(toRaw, 'to');

		if (!from || !to) {
			throw new AppException(AppErrorCode.INVALID_QUERY_PARAM, { field: from ? 'to' : 'from' });
		}

		return this.dashboardFlowService.getFlow(from, to);
	}

	@Get('stats/revenue')
	@ApiOperation({
		summary: 'Revenue by tour date: earned for finished tours, expected for upcoming ones',
	})
	@ApiQuery({ name: 'from', required: true, description: 'YYYY-MM-DD' })
	@ApiQuery({ name: 'to', required: true, description: 'YYYY-MM-DD' })
	async getDashboardRevenue(@Query('from') fromRaw: string, @Query('to') toRaw: string) {
		const from = parseOptionalQueryDate(fromRaw, 'from');
		const to = parseOptionalQueryDate(toRaw, 'to');

		if (!from || !to) {
			throw new AppException(AppErrorCode.INVALID_QUERY_PARAM, { field: from ? 'to' : 'from' });
		}

		assertRevenueRange(from, to);

		return this.dashboardRevenueService.getRevenue(from, to);
	}

	@Get('stats/revenue/timeline')
	@ApiOperation({
		summary: 'What was expected on each day of a period, with a reconciliation of the change',
	})
	@ApiQuery({ name: 'from', required: true, description: 'YYYY-MM-DD' })
	@ApiQuery({ name: 'to', required: true, description: 'YYYY-MM-DD' })
	async getDashboardExpectedTimeline(@Query('from') fromRaw: string, @Query('to') toRaw: string) {
		const from = parseOptionalQueryDate(fromRaw, 'from');
		const to = parseOptionalQueryDate(toRaw, 'to');

		if (!from || !to) {
			throw new AppException(AppErrorCode.INVALID_QUERY_PARAM, { field: from ? 'to' : 'from' });
		}

		assertRevenueRange(from, to);

		return this.dashboardRevenueService.getExpectedTimeline(from, to);
	}

	@Get('stats/booking-state')
	@ApiOperation({
		summary: 'How bookings stood at the end of each day of a period, from the status history',
	})
	@ApiQuery({ name: 'from', required: true, description: 'YYYY-MM-DD' })
	@ApiQuery({ name: 'to', required: true, description: 'YYYY-MM-DD' })
	async getBookingState(@Query('from') fromRaw: string, @Query('to') toRaw: string) {
		const from = parseOptionalQueryDate(fromRaw, 'from');
		const to = parseOptionalQueryDate(toRaw, 'to');

		if (!from || !to) {
			throw new AppException(AppErrorCode.INVALID_QUERY_PARAM, { field: from ? 'to' : 'from' });
		}

		return this.bookingStatusHistoryService.dailyCounts(from, to);
	}

	@Get('stats/booking-cohort')
	@ApiOperation({ summary: 'What became of the bookings created in a period' })
	@ApiQuery({ name: 'from', required: true, description: 'YYYY-MM-DD' })
	@ApiQuery({ name: 'to', required: true, description: 'YYYY-MM-DD' })
	async getBookingCohort(@Query('from') fromRaw: string, @Query('to') toRaw: string) {
		const from = parseOptionalQueryDate(fromRaw, 'from');
		const to = parseOptionalQueryDate(toRaw, 'to');

		if (!from || !to) {
			throw new AppException(AppErrorCode.INVALID_QUERY_PARAM, { field: from ? 'to' : 'from' });
		}

		return this.bookingStatusHistoryService.cohort(from, to);
	}

	@Get('stats/snapshots')
	@ApiOperation({ summary: 'Frozen daily state snapshots over a period' })
	@ApiQuery({ name: 'from', required: true, description: 'YYYY-MM-DD' })
	@ApiQuery({ name: 'to', required: true, description: 'YYYY-MM-DD' })
	async getDashboardSnapshots(@Query('from') fromRaw: string, @Query('to') toRaw: string) {
		const from = parseOptionalQueryDate(fromRaw, 'from');
		const to = parseOptionalQueryDate(toRaw, 'to');

		if (!from || !to) {
			throw new AppException(AppErrorCode.INVALID_QUERY_PARAM, { field: from ? 'to' : 'from' });
		}

		return this.dashboardSnapshotService.findRange(from, to);
	}

	@Post('stats/snapshots/capture')
	@ApiOperation({
		summary:
			'Capture a state snapshot for a day — for verifying the job and backfilling a missed run',
	})
	@ApiQuery({ name: 'date', required: false, description: 'YYYY-MM-DD, defaults to yesterday' })
	async captureSnapshot(@Query('date') dateRaw?: string) {
		const date = parseOptionalQueryDate(dateRaw, 'date');

		if (date) {
			await this.dashboardSnapshotService.capture(new Date(`${date}T00:00:00.000Z`));
		} else {
			await this.dashboardSnapshotService.captureYesterday();
		}
	}

	@Get('bookings/by-reference/:ref')
	@ApiOperation({ summary: 'Find booking by reference number' })
	async getBookingByReference(@Param('ref') ref: string) {
		const referenceNumber = parseInt(ref, 10);
		if (isNaN(referenceNumber)) {
			throw new AppException(AppErrorCode.INVALID_REFERENCE_NUMBER);
		}
		return this.bookingsAdminService.findByReference(referenceNumber);
	}

	@Get('bookings/by-checkin-token/:token')
	@ApiOperation({ summary: 'Find booking by a scanned check-in QR token' })
	async getBookingByCheckinToken(@Param('token') token: string) {
		return this.bookingsAdminService.findByCheckinToken(token);
	}

	@Get('bookings/:id')
	@ApiOperation({ summary: 'Get booking by ID (admin only)' })
	async getBookingById(@Param('id') id: string) {
		const booking = await this.bookingsAdminService.findOne(id);
		if (!booking) {
			throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
		}
		return booking;
	}

	@Get('bookings')
	@ApiOperation({ summary: 'Get all bookings with pagination (admin only)' })
	@ApiQuery({ name: 'skip', required: false, description: 'Items to skip', type: Number })
	@ApiQuery({
		name: 'limit',
		required: false,
		description: 'Items per page (max 100)',
		type: Number,
	})
	@ApiQuery({ name: 'eventId', required: false })
	@ApiQuery({ name: 'occurrenceId', required: false })
	@ApiQuery({ name: 'search', required: false, description: 'Search in user and event fields' })
	@ApiQuery({ name: 'status', required: false, enum: BookingDisplayStatusEnum.options })
	@ApiQuery({ name: 'time', required: false, enum: TimeFilterSchema.options })
	@ApiQuery({
		name: 'createdFrom',
		required: false,
		description: 'Booking created on or after (YYYY-MM-DD)',
	})
	@ApiQuery({
		name: 'createdTo',
		required: false,
		description: 'Booking created on or before (YYYY-MM-DD)',
	})
	@ApiQuery({ name: 'tourFrom', required: false, description: 'Tour date on or after (YYYY-MM-DD)' })
	@ApiQuery({ name: 'tourTo', required: false, description: 'Tour date on or before (YYYY-MM-DD)' })
	@ApiQuery({ name: 'paymentMethod', required: false, enum: PaymentMethodEnum.options })
	@ApiQuery({ name: 'createdBy', required: false, enum: BookingAuthorSchema.options })
	async getAllBookings(
		@Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number = 0,
		@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
		@Query('search') search?: string,
		@Query('status') status?: BookingDisplayStatus,
		@Query('time') time?: TimeFilterType,
		@Query('eventId') eventId?: string,
		@Query('occurrenceId') occurrenceId?: string,
		@Query('createdFrom') createdFromRaw?: string,
		@Query('createdTo') createdToRaw?: string,
		@Query('tourFrom') tourFromRaw?: string,
		@Query('tourTo') tourToRaw?: string,
		@Query('paymentMethod') paymentMethod?: PaymentMethod,
		@Query('createdBy') createdBy?: BookingAuthor,
	) {
		const safeLimit = Math.min(limit, 100);
		return this.bookingsAdminService.findAll({
			skip,
			limit: safeLimit,
			search,
			status,
			time,
			eventId,
			occurrenceId,
			createdFrom: parseOptionalQueryDate(createdFromRaw, 'createdFrom'),
			createdTo: parseOptionalQueryDate(createdToRaw, 'createdTo'),
			tourFrom: parseOptionalQueryDate(tourFromRaw, 'tourFrom'),
			tourTo: parseOptionalQueryDate(tourToRaw, 'tourTo'),
			paymentMethod,
			createdBy,
		});
	}

	@Post('bookings/:id/quantity/quote')
	@ApiOperation({
		summary: 'Show what changing the number of guests would refund or collect (admin only)',
	})
	@ApiBody(getReference('QuantityQuoteRequestSchema'))
	async quoteBookingQuantity(
		@Param('id') id: string,
		@Body(new ZodValidationPipe(QuantityQuoteRequestSchema)) data: QuantityQuoteRequest,
	) {
		return this.bookingService.quoteQuantity({ kind: 'admin' }, id, data);
	}

	@Patch('bookings/:id/quantity')
	@ApiOperation({ summary: 'Change the number of guests, with the money settled (admin only)' })
	@ApiResponse({ status: 429, description: 'Too many admin actions' })
	@ApiBody(getReference('ChangeQuantitySchema'))
	async changeBookingQuantity(
		@GetCurrentUserId() adminId: string,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(ChangeQuantitySchema)) data: ChangeQuantityData,
	) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:action`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_MAX_PER_MINUTE,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_WINDOW_SEC,
		);
		return this.bookingService.changeQuantity({ kind: 'admin' }, id, data);
	}

	@Post('bookings/:id/checkin')
	@ApiOperation({ summary: 'Check in a booking' })
	@ApiResponse({ status: 429, description: 'Too many admin actions' })
	async checkInBooking(@GetCurrentUserId() adminId: string, @Param('id') id: string) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:action`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_MAX_PER_MINUTE,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_WINDOW_SEC,
		);
		return this.bookingsAdminService.checkIn(id, adminId);
	}

	@Delete('bookings/:id/checkin')
	@ApiOperation({ summary: 'Undo a check-in made by mistake' })
	@ApiResponse({ status: 429, description: 'Too many admin actions' })
	async undoBookingCheckIn(@GetCurrentUserId() adminId: string, @Param('id') id: string) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:action`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_MAX_PER_MINUTE,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_WINDOW_SEC,
		);
		return this.bookingsAdminService.undoCheckIn(id, adminId);
	}

	@Get('events/:id')
	@ApiOperation({ summary: 'Get event by ID (admin only)' })
	async getEventById(@Param('id') id: string) {
		const event = await this.eventService.findOneAny(id);
		if (!event) {
			throw new AppException(AppErrorCode.EVENT_NOT_FOUND);
		}
		return event;
	}

	@Get('events')
	@ApiOperation({ summary: 'Get all events (admin sees all statuses)' })
	@ApiQuery({ name: 'skip', required: false, description: 'Items to skip', type: Number })
	@ApiQuery({
		name: 'limit',
		required: false,
		description: 'Items per page (max 100)',
		type: Number,
	})
	@ApiQuery({
		name: 'search',
		required: false,
		description: 'Search in title, description, category, location',
	})
	@ApiQuery({ name: 'status', required: false, enum: EventStatusEnum.options })
	@ApiQuery({ name: 'difficulty', required: false, enum: EventDifficultyEnum.options })
	@ApiQuery({ name: 'time', required: false, enum: TimeFilterSchema.options })
	@ApiQuery({ name: 'minPrice', required: false, type: Number })
	@ApiQuery({ name: 'maxPrice', required: false, type: Number })
	@ApiQuery({ name: 'category', required: false, description: 'Category slug' })
	@ApiQuery({
		name: 'startDate',
		required: false,
		description: 'Event runs on or after (YYYY-MM-DD)',
	})
	@ApiQuery({
		name: 'endDate',
		required: false,
		description: 'Event runs on or before (YYYY-MM-DD)',
	})
	@ApiQuery({ name: 'spots', required: false, enum: SpotsFilterSchema.options })
	async getAllEvents(
		@Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number = 0,
		@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
		@Query('search') search?: string,
		@Query('status') status?: EventStatus,
		@Query('difficulty') difficulty?: EventDifficulty,
		@Query('time') time?: TimeFilterType,
		@Query('minPrice') minPriceRaw?: string,
		@Query('maxPrice') maxPriceRaw?: string,
		@Query('category') category?: string,
		@Query('startDate') startDateRaw?: string,
		@Query('endDate') endDateRaw?: string,
		@Query('spots') spots?: SpotsFilterType,
	) {
		const safeLimit = Math.min(limit, 100);
		const minPrice = parseOptionalQueryInt(minPriceRaw, 'minPrice');
		const maxPrice = parseOptionalQueryInt(maxPriceRaw, 'maxPrice');
		const startDate = parseOptionalQueryDate(startDateRaw, 'startDate');
		const endDate = parseOptionalQueryDate(endDateRaw, 'endDate');
		return this.eventsAdminService.findAll({
			skip,
			limit: safeLimit,
			search,
			status,
			difficulty,
			time,
			minPrice,
			maxPrice,
			category,
			startDate,
			endDate,
			spots,
		});
	}

	@Get('users')
	@ApiOperation({ summary: 'Get all users with pagination (admin only)' })
	@ApiQuery({ name: 'skip', required: false, description: 'Items to skip', type: Number })
	@ApiQuery({
		name: 'limit',
		required: false,
		description: 'Items per page (max 100)',
		type: Number,
	})
	@ApiQuery({ name: 'search', required: false, description: 'Search in name and email' })
	@ApiQuery({ name: 'role', required: false, enum: UserRoleSchema.options })
	@ApiQuery({ name: 'emailVerified', required: false, enum: ['true', 'false'] })
	@ApiQuery({ name: 'isShadow', required: false, enum: ['true', 'false'] })
	@ApiQuery({
		name: 'createdFrom',
		required: false,
		description: 'Registered on or after (YYYY-MM-DD)',
	})
	@ApiQuery({
		name: 'createdTo',
		required: false,
		description: 'Registered on or before (YYYY-MM-DD)',
	})
	async getAllUsers(
		@Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number = 0,
		@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
		@Query('search') search?: string,
		@Query('role') role?: UserRoleType,
		@Query('emailVerified') emailVerified?: string,
		@Query('isShadow') isShadow?: string,
		@Query('createdFrom') createdFromRaw?: string,
		@Query('createdTo') createdToRaw?: string,
	) {
		const safeLimit = Math.min(limit, 100);

		return this.usersService.findAll({
			skip,
			limit: safeLimit,
			search,
			role,
			emailVerified: parseOptionalQueryBoolean(emailVerified),
			isShadow: parseOptionalQueryBoolean(isShadow),
			createdFrom: parseOptionalQueryDate(createdFromRaw, 'createdFrom'),
			createdTo: parseOptionalQueryDate(createdToRaw, 'createdTo'),
		});
	}

	@Get('users/:id')
	@ApiOperation({ summary: 'Get user by ID (admin only)' })
	async getUserById(@Param('id') id: string) {
		const user = await this.usersService.findOne(id);
		if (!user) {
			throw new AppException(AppErrorCode.USER_NOT_FOUND);
		}
		return user;
	}

	@Patch('users/:id')
	@ApiOperation({ summary: 'Fix a guest profile created by an admin' })
	@ApiResponse({ status: 429, description: 'Too many admin actions' })
	@ApiBody(getReference('UpdateShadowUserSchema'))
	async updateShadowUser(
		@GetCurrentUserId() adminId: string,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(UpdateShadowUserSchema)) data: UpdateShadowUserData,
	) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:action`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_MAX_PER_MINUTE,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_WINDOW_SEC,
		);
		return this.usersService.updateShadow(id, data);
	}

	@Patch('users/:id/role')
	@ApiOperation({ summary: 'Update user role (admin only)' })
	@ApiResponse({ status: 429, description: 'Too many admin actions' })
	async updateUserRole(
		@GetCurrentUserId() adminId: string,
		@Param('id') id: string,
		@Body('role') role: UserRoleType,
	) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:action`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_MAX_PER_MINUTE,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_WINDOW_SEC,
		);
		return this.usersService.updateRole(adminId, id, role);
	}

	@Post('bookings/:id/cancel')
	@ApiOperation({ summary: 'Cancel a booking from admin panel with refund strategy' })
	@ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
	@ApiBody(getReference('AdminCancelBookingSchema'))
	async cancelBookingByAdmin(
		@GetCurrentUserId() adminId: string,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(AdminCancelBookingSchema)) data: AdminCancelBookingData,
	) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:action`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_MAX_PER_MINUTE,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_WINDOW_SEC,
		);

		return this.bookingCancellationService.cancel(adminId, id, data);
	}

	@Post('bookings/:id/compensate')
	@ApiOperation({ summary: 'Give money back without cancelling the booking (compensation)' })
	@ApiBody(getReference('CompensateBookingSchema'))
	async compensateBooking(
		@GetCurrentUserId() adminId: string,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(CompensateBookingSchema)) data: CompensateBookingData,
	) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:action`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_MAX_PER_MINUTE,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_WINDOW_SEC,
		);

		return this.bookingCancellationService.compensate(adminId, id, data);
	}

	@Post('bookings/:id/transfer')
	@ApiOperation({ summary: 'Move a booking to another date of the same tour' })
	@ApiBody(getReference('TransferBookingSchema'))
	async transferBooking(
		@GetCurrentUserId() adminId: string,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(TransferBookingSchema)) data: TransferBookingData,
	) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:action`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_MAX_PER_MINUTE,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_WINDOW_SEC,
		);

		return this.bookingsAdminService.transferOccurrence(id, data);
	}

	@Post('bookings/manual')
	@ApiOperation({ summary: 'Create a booking manually (offline payment, admin only)' })
	@ApiResponse({ status: 201, description: 'Booking created successfully' })
	@ApiResponse({ status: 404, description: 'Event not found' })
	@ApiResponse({ status: 409, description: 'Already booked or no spots available' })
	@ApiBody(getReference('CreateManualBookingSchema'))
	async createManualBooking(
		@GetCurrentUserId() adminId: string,
		@Body(new ZodValidationPipe(CreateManualBookingSchema)) data: CreateManualBookingData,
		@GetLocale() locale: Locale | undefined,
		@GetBrandHost() brandHost: string | undefined,
	) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:action`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_MAX_PER_MINUTE,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_WINDOW_SEC,
		);

		return this.bookingService.createManualBooking(adminId, data, locale, brandHost);
	}

	@Post('bookings/:id/confirm')
	@ApiOperation({ summary: 'Confirm a pending booking by hand: paid offline or pay on arrival' })
	@ApiResponse({ status: 429, description: 'Too many admin actions' })
	async confirmBookingManually(
		@GetCurrentUserId() adminId: string,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(ConfirmBookingManuallySchema)) data: ConfirmBookingManuallyData,
		@GetLocale() locale: Locale | undefined,
	) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:action`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_MAX_PER_MINUTE,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_WINDOW_SEC,
		);

		return this.bookingService.confirmManually(id, data, locale);
	}

	@Get('categories/:id')
	@ApiOperation({ summary: 'Get category by ID (admin only)' })
	async getCategoryById(@Param('id') id: string) {
		const category = await this.categoriesService.findOne(id);
		if (!category) {
			throw new AppException(AppErrorCode.CATEGORY_NOT_FOUND);
		}
		return category;
	}

	@Get('categories')
	@ApiOperation({ summary: 'Get all categories (admin)' })
	@ApiQuery({ name: 'skip', required: false, type: Number })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	@ApiQuery({ name: 'search', required: false })
	async getAllCategories(
		@Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number = 0,
		@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
		@Query('search') search?: string,
	) {
		const safeLimit = Math.min(limit, 100);
		return this.categoriesService.findAll({ skip, limit: safeLimit, search });
	}

	@Post('categories')
	@ApiOperation({ summary: 'Create category (admin only)' })
	@ApiResponse({ status: 201, description: 'Category created' })
	@ApiBody(getReference('CreateCategorySchema'))
	async createCategory(
		@GetCurrentUserId() adminId: string,
		@Body(new ZodValidationPipe(CreateCategorySchema)) data: CreateCategoryData,
	) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:action`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_MAX_PER_MINUTE,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_WINDOW_SEC,
		);
		return this.categoriesService.create(data);
	}

	@Patch('categories/:id')
	@ApiOperation({ summary: 'Update category (admin only)' })
	@ApiBody(getReference('UpdateCategorySchema'))
	async updateCategory(
		@GetCurrentUserId() adminId: string,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(UpdateCategorySchema)) data: UpdateCategoryData,
	) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:action`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_MAX_PER_MINUTE,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_WINDOW_SEC,
		);
		return this.categoriesService.update(id, data);
	}

	@Delete('categories/:id')
	@ApiOperation({ summary: 'Delete category (admin only)' })
	@ApiResponse({ status: 200, description: 'Category deleted' })
	async deleteCategory(@GetCurrentUserId() adminId: string, @Param('id') id: string) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:delete`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.DELETE_MAX_PER_HOUR,
			ADMIN_CONFIG.RATE_LIMITS.DELETE_WINDOW_SEC,
		);
		await this.categoriesService.delete(id);
	}

	@Get('promo-codes/:id')
	@ApiOperation({ summary: 'Get promo code by ID (admin only)' })
	async getPromoCodeById(@Param('id') id: string) {
		const promoCode = await this.promoCodesService.findOne(id);
		if (!promoCode) {
			throw new AppException(AppErrorCode.PROMO_CODE_NOT_FOUND);
		}
		return promoCode;
	}

	@Get('promo-codes')
	@ApiOperation({ summary: 'Get all promo codes (admin)' })
	@ApiQuery({ name: 'skip', required: false, type: Number })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	@ApiQuery({ name: 'search', required: false })
	async getAllPromoCodes(
		@Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number = 0,
		@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
		@Query('search') search?: string,
	) {
		const safeLimit = Math.min(limit, 100);
		return this.promoCodesService.findAll({ skip, limit: safeLimit, search });
	}

	@Post('promo-codes')
	@ApiOperation({ summary: 'Create promo code (admin only)' })
	@ApiResponse({ status: 201, description: 'Promo code created' })
	@ApiBody(getReference('CreatePromoCodeSchema'))
	async createPromoCode(
		@GetCurrentUserId() adminId: string,
		@Body(new ZodValidationPipe(CreatePromoCodeSchema)) data: CreatePromoCodeData,
	) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:action`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_MAX_PER_MINUTE,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_WINDOW_SEC,
		);
		return this.promoCodesService.create(data);
	}

	@Patch('promo-codes/:id')
	@ApiOperation({ summary: 'Update promo code (admin only)' })
	@ApiBody(getReference('UpdatePromoCodeSchema'))
	async updatePromoCode(
		@GetCurrentUserId() adminId: string,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(UpdatePromoCodeSchema)) data: UpdatePromoCodeData,
	) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:action`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_MAX_PER_MINUTE,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_WINDOW_SEC,
		);
		return this.promoCodesService.update(id, data);
	}

	@Delete('promo-codes/:id')
	@ApiOperation({ summary: 'Delete promo code (admin only)' })
	@ApiResponse({ status: 200, description: 'Promo code deleted' })
	async deletePromoCode(@GetCurrentUserId() adminId: string, @Param('id') id: string) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:delete`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.DELETE_MAX_PER_HOUR,
			ADMIN_CONFIG.RATE_LIMITS.DELETE_WINDOW_SEC,
		);
		await this.promoCodesService.delete(id);
	}
}
