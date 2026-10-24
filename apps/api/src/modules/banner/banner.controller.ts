import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Put,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { ADMIN_CONFIG, ReorderBannersSchema, UserRoleSchema } from '@event-space/shared';
import type { ReorderBannersData } from '@event-space/shared';
import { GetCurrentUserId, Roles, RolesGuard, ZodValidationPipe } from '@shared';
import { AccessTokenGuard } from '@modules/auth/guards/access-token.guard';
import { RateLimiterService } from '@infra/rate-limiter/rate-limiter.service';
import { BannerService } from './banner.service';
import { BannerAdminService } from './banner-admin.service';
import { bannerImageUploadOptions } from './banner.constants';
import {
	parseCreateBannerMultipart,
	parseUpdateBannerMultipart,
	type MultipartBannerFiles,
} from './banner-multipart.mapper';

const BANNER_IMAGE_FIELDS = [
	{ name: 'image', maxCount: 1 },
	{ name: 'imageMobile', maxCount: 1 },
];

const MULTIPART_BODY = {
	schema: {
		type: 'object',
		required: ['payload'],
		properties: {
			payload: {
				type: 'string',
				description: 'JSON: banner fields + translations[]',
			},
			image: { type: 'string', format: 'binary', description: 'Desktop picture' },
			imageMobile: { type: 'string', format: 'binary', description: 'Optional phone picture' },
		},
	},
};

@ApiTags('banners')
@Controller('banners')
export class BannerController {
	constructor(
		private readonly bannerService: BannerService,
		private readonly bannerAdminService: BannerAdminService,
		private readonly rateLimiter: RateLimiterService,
	) {}

	@Get()
	@ApiOperation({ summary: 'Banners currently on show' })
	@ApiResponse({ status: 200, description: 'Returns the active banners in display order' })
	findActive() {
		return this.bannerService.findActive();
	}

	@Get('admin')
	@ApiBearerAuth()
	@Roles(UserRoleSchema.enum.ADMIN)
	@UseGuards(AccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'All banners, drafts and expired ones included (admin only)' })
	findAllForAdmin() {
		return this.bannerAdminService.findAll();
	}

	@Post()
	@ApiBearerAuth()
	@Roles(UserRoleSchema.enum.ADMIN)
	@UseGuards(AccessTokenGuard, RolesGuard)
	@UseInterceptors(FileFieldsInterceptor(BANNER_IMAGE_FIELDS, bannerImageUploadOptions))
	@ApiConsumes('multipart/form-data')
	@ApiOperation({ summary: 'Create a banner (admin only)' })
	@ApiResponse({ status: 201, description: 'Banner created' })
	@ApiBody(MULTIPART_BODY)
	async create(
		@GetCurrentUserId() adminId: string,
		@Body('payload') payload: string,
		@UploadedFiles() files?: MultipartBannerFiles,
	) {
		await this.consumeActionLimit(adminId);

		const parsed = parseCreateBannerMultipart(payload, files);

		return this.bannerAdminService.create(parsed.data, parsed.files);
	}

	@Put(':id')
	@ApiBearerAuth()
	@Roles(UserRoleSchema.enum.ADMIN)
	@UseGuards(AccessTokenGuard, RolesGuard)
	@UseInterceptors(FileFieldsInterceptor(BANNER_IMAGE_FIELDS, bannerImageUploadOptions))
	@ApiConsumes('multipart/form-data')
	@ApiOperation({ summary: 'Update a banner (admin only)' })
	@ApiParam({ name: 'id', description: 'Banner ID' })
	@ApiBody(MULTIPART_BODY)
	async update(
		@GetCurrentUserId() adminId: string,
		@Param('id') id: string,
		@Body('payload') payload: string,
		@UploadedFiles() files?: MultipartBannerFiles,
	) {
		await this.consumeActionLimit(adminId);

		const parsed = parseUpdateBannerMultipart(payload, files);

		return this.bannerAdminService.update(id, parsed.data, parsed.files);
	}

	@Patch('reorder')
	@ApiBearerAuth()
	@Roles(UserRoleSchema.enum.ADMIN)
	@UseGuards(AccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Set the display order (admin only)' })
	async reorder(
		@GetCurrentUserId() adminId: string,
		@Body(new ZodValidationPipe(ReorderBannersSchema)) data: ReorderBannersData,
	) {
		await this.consumeActionLimit(adminId);

		return this.bannerAdminService.reorder(data.ids);
	}

	@Delete(':id')
	@ApiBearerAuth()
	@Roles(UserRoleSchema.enum.ADMIN)
	@UseGuards(AccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Delete a banner (admin only)' })
	@ApiParam({ name: 'id', description: 'Banner ID' })
	async delete(@GetCurrentUserId() adminId: string, @Param('id') id: string) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:delete`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.DELETE_MAX_PER_HOUR,
			ADMIN_CONFIG.RATE_LIMITS.DELETE_WINDOW_SEC,
		);

		await this.bannerAdminService.delete(id);
	}

	private consumeActionLimit(adminId: string): Promise<unknown> {
		return this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:action`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_MAX_PER_MINUTE,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_WINDOW_SEC,
		);
	}
}
