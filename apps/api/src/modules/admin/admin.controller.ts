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
import { AdminService } from './admin.service';
import { DashboardFlowService } from './dashboard-flow.service';
import { DashboardSnapshotService } from './dashboard-snapshot.service';
import { BookingStatusHistoryService } from './booking-status-history.service';
import {
	AppException,
	Roles,
	RolesGuard,
	GetCurrentUserId,
	ZodValidationPipe,
	parseOptionalQueryInt,
	parseOptionalQueryBoolean,
	parseOptionalQueryDate,
} from '@shared';
import { AccessTokenGuard } from '@modules/auth/guards/access-token.guard';
import { RateLimiterService } from '@infra/rate-limiter/rate-limiter.service';
import {
	BookingStatusEnum,
	PaymentMethodEnum,
	EventStatusEnum,
	EventDifficultyEnum,
	UserRoleSchema,
	TimeFilterSchema,
	CreateManualBookingSchema,
	CreateCategorySchema,
	UpdateCategorySchema,
	AdminCancelBookingSchema,
	UpdateBookingSchema,
} from '@event-space/shared';
import { ADMIN_CONFIG } from '@event-space/shared/constants';
import { AppErrorCode } from '@event-space/shared';
import type {
	BookingStatus,
	EventDifficulty,
	EventStatus,
	UserRoleType,
	TimeFilterType,
	CreateManualBookingData,
	CreateCategoryData,
	UpdateCategoryData,
	AdminCancelBookingData,
	UpdateBookingData,
	PaymentMethod,
} from '@event-space/shared';
import { BookingService } from '@modules/booking/booking.service';
import { getReference } from '@infra/swagger/swagger.utils';
import { EventService } from '@modules/event/event.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
	constructor(
		private readonly adminService: AdminService,
		private readonly dashboardFlowService: DashboardFlowService,
		private readonly dashboardSnapshotService: DashboardSnapshotService,
		private readonly bookingStatusHistoryService: BookingStatusHistoryService,
		private readonly bookingService: BookingService,
		private readonly eventService: EventService,
		private readonly rateLimiter: RateLimiterService,
	) {}

	@Get('stats')
	@ApiOperation({ summary: 'Get dashboard statistics' })
	async getDashboardStats() {
		return this.adminService.getDashboardStats();
	}

	@Get('stats/flow')
	@ApiOperation({ summary: 'Bookings and revenue per day over a period, with previous-period totals' })
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
		summary: 'Capture a state snapshot for a day — for verifying the job and backfilling a missed run',
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
		return this.adminService.findBookingByReference(referenceNumber);
	}

	@Get('bookings/:id')
	@ApiOperation({ summary: 'Get booking by ID (admin only)' })
	async getBookingById(@Param('id') id: string) {
		const booking = await this.adminService.findOneBooking(id);
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
	@ApiQuery({ name: 'search', required: false, description: 'Search in user and event fields' })
	@ApiQuery({ name: 'status', required: false, enum: BookingStatusEnum.options })
	@ApiQuery({ name: 'time', required: false, enum: TimeFilterSchema.options })
	@ApiQuery({ name: 'createdFrom', required: false, description: 'Booking created on or after (YYYY-MM-DD)' })
	@ApiQuery({ name: 'createdTo', required: false, description: 'Booking created on or before (YYYY-MM-DD)' })
	@ApiQuery({ name: 'paymentMethod', required: false, enum: PaymentMethodEnum.options })
	async getAllBookings(
		@Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number = 0,
		@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
		@Query('search') search?: string,
		@Query('status') status?: BookingStatus,
		@Query('time') time?: TimeFilterType,
		@Query('eventId') eventId?: string,
		@Query('createdFrom') createdFromRaw?: string,
		@Query('createdTo') createdToRaw?: string,
		@Query('paymentMethod') paymentMethod?: PaymentMethod,
	) {
		const safeLimit = Math.min(limit, 100);
		return this.adminService.findAllBookings({
			skip,
			limit: safeLimit,
			search,
			status,
			time,
			eventId,
			createdFrom: parseOptionalQueryDate(createdFromRaw, 'createdFrom'),
			createdTo: parseOptionalQueryDate(createdToRaw, 'createdTo'),
			paymentMethod,
		});
	}

	@Patch('bookings/:id/status')
	@ApiOperation({ summary: 'Update booking status (admin only)' })
	@ApiResponse({ status: 429, description: 'Too many admin actions' })
	async updateBookingStatus(
		@GetCurrentUserId() adminId: string,
		@Param('id') id: string,
		@Body('status') status: BookingStatus,
	) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:action`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_MAX_PER_MINUTE,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_WINDOW_SEC,
		);
		return this.adminService.updateBookingStatus(id, status);
	}

	@Patch('bookings/:id')
	@ApiOperation({ summary: 'Update booking quantity (admin only)' })
	@ApiResponse({ status: 429, description: 'Too many admin actions' })
	@ApiBody(getReference('UpdateBookingSchema'))
	async updateBooking(
		@GetCurrentUserId() adminId: string,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(UpdateBookingSchema)) data: UpdateBookingData,
	) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:action`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_MAX_PER_MINUTE,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_WINDOW_SEC,
		);
		return this.adminService.updateBooking(id, data);
	}

	@Post('bookings/:id/checkin')
	@ApiOperation({ summary: 'Check in a booking' })
	@ApiResponse({ status: 429, description: 'Too many admin actions' })
	async checkInBooking(
		@GetCurrentUserId() adminId: string,
		@Param('id') id: string,
	) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:action`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_MAX_PER_MINUTE,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_WINDOW_SEC,
		);
		return this.adminService.checkInBooking(id);
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
	@ApiQuery({ name: 'startDate', required: false, description: 'Event runs on or after (YYYY-MM-DD)' })
	@ApiQuery({ name: 'endDate', required: false, description: 'Event runs on or before (YYYY-MM-DD)' })
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
	) {
		const safeLimit = Math.min(limit, 100);
		const minPrice = parseOptionalQueryInt(minPriceRaw, 'minPrice');
		const maxPrice = parseOptionalQueryInt(maxPriceRaw, 'maxPrice');
		const startDate = parseOptionalQueryDate(startDateRaw, 'startDate');
		const endDate = parseOptionalQueryDate(endDateRaw, 'endDate');
		return this.adminService.findAllEvents({
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
	@ApiQuery({ name: 'createdFrom', required: false, description: 'Registered on or after (YYYY-MM-DD)' })
	@ApiQuery({ name: 'createdTo', required: false, description: 'Registered on or before (YYYY-MM-DD)' })
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

		return this.adminService.findAllUsers({
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
		const user = await this.adminService.findOneUser(id);
		if (!user) {
			throw new AppException(AppErrorCode.USER_NOT_FOUND);
		}
		return user;
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
		return this.adminService.updateUserRole(id, role);
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

		return this.adminService.adminCancelBooking(adminId, id, data);
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
	) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:action`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_MAX_PER_MINUTE,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_WINDOW_SEC,
		);

		return this.bookingService.createManualBooking(adminId, data);
	}

	@Get('categories/:id')
	@ApiOperation({ summary: 'Get category by ID (admin only)' })
	async getCategoryById(@Param('id') id: string) {
		const category = await this.adminService.findOneCategory(id);
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
		return this.adminService.findAllCategories({ skip, limit: safeLimit, search });
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
		return this.adminService.createCategory(data);
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
		return this.adminService.updateCategory(id, data);
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
		await this.adminService.deleteCategory(id);
	}
}
