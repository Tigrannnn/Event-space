import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '@modules/auth/guards/access-token.guard';
import { RateLimiterService } from '@infra/rate-limiter/rate-limiter.service';
import { ADMIN_CONFIG } from '@event-space/shared/constants';
import {
	CreateSourceSchema,
	UpdateSourceSchema,
	type CreateSourceData,
	type UpdateSourceData,
} from '@event-space/shared';
import { getReference } from '@infra/swagger/swagger.utils';
import {
	GetCurrentUserId,
	parseOptionalQueryBoolean,
	Roles,
	RolesGuard,
	ZodValidationPipe,
} from '@shared';
import { AdminSourcesService } from './admin-sources.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/sources')
export class AdminSourcesController {
	constructor(
		private readonly sources: AdminSourcesService,
		private readonly rateLimiter: RateLimiterService,
	) {}

	@Get()
	@ApiOperation({ summary: 'Where customers learn about the company, with what each brought (admin only)' })
	@ApiQuery({ name: 'includeArchived', required: false, type: Boolean })
	findAll(@Query('includeArchived') includeArchived?: string) {
		return this.sources.findAll({ includeArchived: parseOptionalQueryBoolean(includeArchived) });
	}

	@Post()
	@ApiOperation({ summary: 'Add a source with its link label (admin only)' })
	@ApiBody(getReference('CreateSourceSchema'))
	async create(
		@GetCurrentUserId() adminId: string,
		@Body(new ZodValidationPipe(CreateSourceSchema)) data: CreateSourceData,
	) {
		await this.limit(adminId);
		return this.sources.create(data);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Rename, archive or restore a source (admin only)' })
	@ApiBody(getReference('UpdateSourceSchema'))
	async update(
		@GetCurrentUserId() adminId: string,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(UpdateSourceSchema)) data: UpdateSourceData,
	) {
		await this.limit(adminId);
		return this.sources.update(id, data);
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
