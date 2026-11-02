import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '@modules/auth/guards/access-token.guard';
import { RateLimiterService } from '@infra/rate-limiter/rate-limiter.service';
import { ADMIN_CONFIG } from '@event-space/shared/constants';
import {
	CreateChannelSchema,
	UpdateChannelSchema,
	type CreateChannelData,
	type UpdateChannelData,
} from '@event-space/shared';
import { getReference } from '@infra/swagger/swagger.utils';
import {
	GetCurrentUserId,
	parseOptionalQueryBoolean,
	Roles,
	RolesGuard,
	ZodValidationPipe,
} from '@shared';
import { AdminChannelsService } from './admin-channels.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/channels')
export class AdminChannelsController {
	constructor(
		private readonly channels: AdminChannelsService,
		private readonly rateLimiter: RateLimiterService,
	) {}

	@Get()
	@ApiOperation({ summary: 'Channels bookings are sold on and reviews are written on (admin only)' })
	@ApiQuery({ name: 'forBookings', required: false, type: Boolean })
	@ApiQuery({ name: 'forReviews', required: false, type: Boolean })
	@ApiQuery({ name: 'includeArchived', required: false, type: Boolean })
	findAll(
		@Query('forBookings') forBookings?: string,
		@Query('forReviews') forReviews?: string,
		@Query('includeArchived') includeArchived?: string,
	) {
		return this.channels.findAll({
			forBookings: parseOptionalQueryBoolean(forBookings),
			forReviews: parseOptionalQueryBoolean(forReviews),
			includeArchived: parseOptionalQueryBoolean(includeArchived),
		});
	}

	@Post()
	@ApiOperation({ summary: 'Add a channel (admin only)' })
	@ApiBody(getReference('CreateChannelSchema'))
	async create(
		@GetCurrentUserId() adminId: string,
		@Body(new ZodValidationPipe(CreateChannelSchema)) data: CreateChannelData,
	) {
		await this.limit(adminId);
		return this.channels.create(data);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Rename, archive or restore a channel (admin only)' })
	@ApiBody(getReference('UpdateChannelSchema'))
	async update(
		@GetCurrentUserId() adminId: string,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(UpdateChannelSchema)) data: UpdateChannelData,
	) {
		await this.limit(adminId);
		return this.channels.update(id, data);
	}

	private limit(adminId: string) {
		return this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:action`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_MAX_PER_MINUTE,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_WINDOW_SEC,
		);
	}
}
