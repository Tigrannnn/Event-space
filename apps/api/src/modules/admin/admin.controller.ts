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
	BadRequestException,
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
import { EventService } from '@modules/event/event.service';
import { Roles, RolesGuard, GetCurrentUserId, ZodValidationPipe, parseOptionalQueryInt } from '@shared';
import { AccessTokenGuard } from '@modules/auth/guards/access-token.guard';
import { RateLimiterService } from '@infra/rate-limiter/rate-limiter.service';
import {
	BookingStatusEnum,
	EventStatusEnum,
	EventDifficultyEnum,
	UserRoleSchema,
	TimeFilterSchema,
	CreateManualBookingSchema,
	CreateCategorySchema,
	UpdateCategorySchema,
	AdminCancelBookingSchema,
} from '@event-space/shared';
import { ADMIN_CONFIG } from '@event-space/shared/constants';
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
} from '@event-space/shared';
import { BookingService } from '@modules/booking/booking.service';
import { getReference } from '@infra/swagger/swagger.utils';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
	constructor(
		private readonly adminService: AdminService,
		private readonly bookingService: BookingService,
		private readonly rateLimiter: RateLimiterService,
	) {}

	@Get('stats')
	@ApiOperation({ summary: 'Get dashboard statistics' })
	async getDashboardStats() {
		return this.adminService.getDashboardStats();
	}

	@Get('bookings/by-reference/:ref')
	@ApiOperation({ summary: 'Find booking by reference number' })
	async getBookingByReference(@Param('ref') ref: string) {
		const referenceNumber = parseInt(ref, 10);
		if (isNaN(referenceNumber)) {
			throw new BadRequestException('Invalid reference number');
		}
		return this.adminService.findBookingByReference(referenceNumber);
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
	async getAllBookings(
		@Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number = 0,
		@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
		@Query('search') search?: string,
		@Query('status') status?: BookingStatus,
		@Query('time') time?: TimeFilterType,
		@Query('eventId') eventId?: string,
	) {
		const safeLimit = Math.min(limit, 100);
		return this.adminService.findAllBookings({
			skip,
			limit: safeLimit,
			search,
			status,
			time,
			eventId,
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
	async getAllEvents(
		@Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number = 0,
		@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
		@Query('search') search?: string,
		@Query('status') status?: EventStatus,
		@Query('difficulty') difficulty?: EventDifficulty,
		@Query('time') time?: TimeFilterType,
		@Query('minPrice') minPriceRaw?: string,
		@Query('maxPrice') maxPriceRaw?: string,
	) {
		const safeLimit = Math.min(limit, 100);
		const minPrice = parseOptionalQueryInt(minPriceRaw, 'minPrice');
		const maxPrice = parseOptionalQueryInt(maxPriceRaw, 'maxPrice');
		return this.adminService.findAllEvents({
			skip,
			limit: safeLimit,
			search,
			status,
			difficulty,
			time,
			minPrice,
			maxPrice,
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
	async getAllUsers(
		@Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number = 0,
		@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
		@Query('search') search?: string,
		@Query('role') role?: UserRoleType,
		@Query('emailVerified') emailVerified?: string,
	) {
		const safeLimit = Math.min(limit, 100);
		const parsedEmailVerified =
			emailVerified === 'true' ? true : emailVerified === 'false' ? false : undefined;

		return this.adminService.findAllUsers({
			skip,
			limit: safeLimit,
			search,
			role,
			emailVerified: parsedEmailVerified,
		});
	}

	@Get('users/:id')
	@ApiOperation({ summary: 'Get user by ID (admin only)' })
	async getUserById(@Param('id') id: string) {
		const user = await this.adminService.findOneUser(id);
		if (!user) {
			return { message: 'User not found' };
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

	@Delete('users/:id')
	@ApiOperation({ summary: 'Delete user (admin only)' })
	@ApiResponse({ status: 429, description: 'Too many deletion attempts' })
	async deleteUser(@GetCurrentUserId() adminId: string, @Param('id') id: string) {
		// Stricter rate limit for deletions
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:delete`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.DELETE_MAX_PER_HOUR,
			ADMIN_CONFIG.RATE_LIMITS.DELETE_WINDOW_SEC,
		);
		await this.adminService.deleteUser(id);
		return { message: 'User deleted successfully' };
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
		return { message: 'Category deleted successfully' };
	}
}
