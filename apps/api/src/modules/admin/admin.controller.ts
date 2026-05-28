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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { EventService } from '@modules/event/event.service';
import { Roles, RolesGuard } from '@shared';
import { AccessTokenGuard } from '@modules/auth/guards/access-token.guard';
import {
	BookingStatusEnum,
	EventStatusEnum,
	EventDifficultyEnum,
	UserRoleSchema,
	TimeFilterSchema,
} from '@event-space/shared';
import type {
	BookingStatus,
	EventDifficulty,
	EventStatus,
	UserRoleType,
	TimeFilterType,
} from '@event-space/shared';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
	constructor(private readonly adminService: AdminService) {}

	@Get('stats')
	@ApiOperation({ summary: 'Get dashboard statistics' })
	async getDashboardStats() {
		return this.adminService.getDashboardStats();
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
	async updateBookingStatus(@Param('id') id: string, @Body('status') status: BookingStatus) {
		return this.adminService.updateBookingStatus(id, status);
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
	async getAllEvents(
		@Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number = 0,
		@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
		@Query('search') search?: string,
		@Query('status') status?: EventStatus,
		@Query('difficulty') difficulty?: EventDifficulty,
		@Query('time') time?: TimeFilterType,
	) {
		const safeLimit = Math.min(limit, 100);
		return this.adminService.findAllEvents({
			skip,
			limit: safeLimit,
			search,
			status,
			difficulty,
			time,
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
	async updateUserRole(@Param('id') id: string, @Body('role') role: UserRoleType) {
		return this.adminService.updateUserRole(id, role);
	}

	@Delete('users/:id')
	@ApiOperation({ summary: 'Delete user (admin only)' })
	async deleteUser(@Param('id') id: string) {
		await this.adminService.deleteUser(id);
		return { message: 'User deleted successfully' };
	}
}
