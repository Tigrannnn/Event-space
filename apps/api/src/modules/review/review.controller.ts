import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import {
	CreateReviewSchema,
	ModerateReviewSchema,
	ReplyToReviewSchema,
	ReviewStatusEnum,
	UpdateReviewSchema,
	UserRoleSchema,
} from '@event-space/shared';
import type {
	CreateReviewData,
	ModerateReviewData,
	ReplyToReviewData,
	ReviewStatus,
	UpdateReviewData,
} from '@event-space/shared';
import { ADMIN_CONFIG, BOOKING_CONFIG } from '@event-space/shared/constants';
import {
	GetCurrentUserId,
	parseOptionalQueryInt,
	Roles,
	RolesGuard,
	ZodValidationPipe,
} from '@shared';
import { AccessTokenGuard } from '@modules/auth/guards/access-token.guard';
import { RateLimiterService } from '@infra/rate-limiter/rate-limiter.service';
import { ReviewService } from './review.service';
import { ReviewAdminService } from './review-admin.service';

/** An unknown status is dropped rather than refused: the queue simply comes back unfiltered. */
function parseReviewStatus(value?: string): ReviewStatus | undefined {
	return value && ReviewStatusEnum.options.includes(value as ReviewStatus)
		? (value as ReviewStatus)
		: undefined;
}

@ApiTags('reviews')
@Controller()
export class ReviewController {
	constructor(
		private readonly reviewService: ReviewService,
		private readonly reviewAdminService: ReviewAdminService,
		private readonly rateLimiter: RateLimiterService,
	) {}

	@Get('events/:eventId/reviews')
	@ApiOperation({ summary: 'Published reviews of an event, newest first' })
	@ApiParam({ name: 'eventId', description: 'Event ID' })
	@ApiQuery({ name: 'cursor', required: false, description: 'nextCursor of the previous page' })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	findForEvent(
		@Param('eventId') eventId: string,
		@Query('cursor') cursor?: string,
		@Query('limit') limit?: string,
	) {
		return this.reviewService.findForEvent(eventId, {
			cursor,
			limit: parseOptionalQueryInt(limit, 'limit'),
		});
	}

	@Get('bookings/:bookingId/review')
	@ApiBearerAuth()
	@UseGuards(AccessTokenGuard)
	@ApiOperation({ summary: 'My review of this booking, and whether I may write one' })
	findMine(@GetCurrentUserId() userId: string, @Param('bookingId') bookingId: string) {
		return this.reviewService.findMine(userId, bookingId);
	}

	@Post('bookings/:bookingId/review')
	@ApiBearerAuth()
	@UseGuards(AccessTokenGuard)
	@ApiOperation({ summary: 'Rate the tour this booking was for' })
	@ApiResponse({ status: 201, description: 'Review saved' })
	async create(
		@GetCurrentUserId() userId: string,
		@Param('bookingId') bookingId: string,
		@Body(new ZodValidationPipe(CreateReviewSchema)) data: CreateReviewData,
	) {
		await this.rateLimiter.consumePerUser(
			`${BOOKING_CONFIG.KEY_PREFIX}:review`,
			userId,
			BOOKING_CONFIG.RATE_LIMITS.CREATE_MAX_PER_MINUTE,
			BOOKING_CONFIG.RATE_LIMITS.CREATE_WINDOW_SEC,
		);

		return this.reviewService.create(userId, bookingId, data);
	}

	@Patch('reviews/:id')
	@ApiBearerAuth()
	@UseGuards(AccessTokenGuard)
	@ApiOperation({ summary: 'Change my own review, within two days of writing it' })
	update(
		@GetCurrentUserId() userId: string,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(UpdateReviewSchema)) data: UpdateReviewData,
	) {
		return this.reviewService.update(userId, id, data);
	}

	@Get('admin/reviews')
	@ApiBearerAuth()
	@Roles(UserRoleSchema.enum.ADMIN)
	@UseGuards(AccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'The moderation queue (admin only)' })
	@ApiQuery({ name: 'status', required: false, enum: ReviewStatusEnum.options })
	@ApiQuery({ name: 'cursor', required: false })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	findAllForAdmin(
		@Query('status') status?: string,
		@Query('cursor') cursor?: string,
		@Query('limit') limit?: string,
	) {
		return this.reviewAdminService.findAll({
			status: parseReviewStatus(status),
			cursor,
			limit: parseOptionalQueryInt(limit, 'limit'),
		});
	}

	@Get('admin/reviews/pending-count')
	@ApiBearerAuth()
	@Roles(UserRoleSchema.enum.ADMIN)
	@UseGuards(AccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'How many reviews are waiting to be read (admin only)' })
	async pendingCount() {
		return { count: await this.reviewAdminService.pendingCount() };
	}

	@Patch('admin/reviews/:id/moderate')
	@ApiBearerAuth()
	@Roles(UserRoleSchema.enum.ADMIN)
	@UseGuards(AccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Publish or reject a review (admin only)' })
	async moderate(
		@GetCurrentUserId() adminId: string,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(ModerateReviewSchema)) data: ModerateReviewData,
	) {
		await this.consumeAdminLimit(adminId);

		return this.reviewAdminService.moderate(adminId, id, data);
	}

	@Patch('admin/reviews/:id/reply')
	@ApiBearerAuth()
	@Roles(UserRoleSchema.enum.ADMIN)
	@UseGuards(AccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Answer a review on behalf of the company (admin only)' })
	async reply(
		@GetCurrentUserId() adminId: string,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(ReplyToReviewSchema)) data: ReplyToReviewData,
	) {
		await this.consumeAdminLimit(adminId);

		return this.reviewAdminService.reply(id, data);
	}

	@Delete('admin/reviews/:id')
	@ApiBearerAuth()
	@Roles(UserRoleSchema.enum.ADMIN)
	@UseGuards(AccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Delete a review for good (admin only)' })
	async remove(@GetCurrentUserId() adminId: string, @Param('id') id: string) {
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:delete`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.DELETE_MAX_PER_HOUR,
			ADMIN_CONFIG.RATE_LIMITS.DELETE_WINDOW_SEC,
		);

		await this.reviewAdminService.delete(id);
	}

	private consumeAdminLimit(adminId: string): Promise<unknown> {
		return this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:action`,
			adminId,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_MAX_PER_MINUTE,
			ADMIN_CONFIG.RATE_LIMITS.ACTION_WINDOW_SEC,
		);
	}
}
