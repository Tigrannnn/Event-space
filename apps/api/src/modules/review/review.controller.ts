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
	GetOptionalUserId,
	parseOptionalQueryInt,
	Roles,
	RolesGuard,
	ZodValidationPipe,
} from '@shared';
import { AccessTokenGuard } from '@modules/auth/guards/access-token.guard';
import { OptionalAccessTokenGuard } from '@modules/auth/guards/optional-access-token.guard';
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
	@UseGuards(OptionalAccessTokenGuard)
	@ApiOperation({ summary: "Published reviews of an event, plus the visitor's own" })
	@ApiParam({ name: 'eventId', description: 'Event ID' })
	@ApiQuery({ name: 'cursor', required: false, description: 'nextCursor of the previous page' })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	findForEvent(
		@Param('eventId') eventId: string,
		@GetOptionalUserId() userId?: string,
		@Query('cursor') cursor?: string,
		@Query('limit') limit?: string,
	) {
		return this.reviewService.findForEvent(
			eventId,
			{ cursor, limit: parseOptionalQueryInt(limit, 'limit') },
			userId,
		);
	}

	@Get('bookings/:bookingId/review')
	@UseGuards(OptionalAccessTokenGuard)
	@ApiOperation({ summary: 'My review of this booking, and whether I may write one' })
	@ApiQuery({ name: 't', required: false, description: 'Signed link from the invitation email' })
	async findMine(
		@GetOptionalUserId() userId: string | undefined,
		@Param('bookingId') bookingId: string,
		@Query('t') token?: string,
	) {
		const actorId = await this.reviewService.resolveActor(bookingId, userId, token);

		return this.reviewService.findMine(actorId, bookingId);
	}

	@Post('bookings/:bookingId/review')
	@UseGuards(OptionalAccessTokenGuard)
	@ApiOperation({ summary: 'Rate the tour this booking was for' })
	@ApiResponse({ status: 201, description: 'Review saved' })
	@ApiQuery({ name: 't', required: false, description: 'Signed link from the invitation email' })
	async create(
		@GetOptionalUserId() userId: string | undefined,
		@Param('bookingId') bookingId: string,
		@Body(new ZodValidationPipe(CreateReviewSchema)) data: CreateReviewData,
		@Query('t') token?: string,
	) {
		const actorId = await this.reviewService.resolveActor(bookingId, userId, token);

		// Keyed by the booking rather than the person: a guest arriving by link has no account
		// to count against, and one booking can only ever hold one review anyway.
		await this.rateLimiter.consumePerUser(
			`${BOOKING_CONFIG.KEY_PREFIX}:review`,
			bookingId,
			BOOKING_CONFIG.RATE_LIMITS.CREATE_MAX_PER_MINUTE,
			BOOKING_CONFIG.RATE_LIMITS.CREATE_WINDOW_SEC,
		);

		return this.reviewService.create(actorId, bookingId, data);
	}

	@Patch('bookings/:bookingId/review')
	@UseGuards(OptionalAccessTokenGuard)
	@ApiOperation({ summary: 'Change my own review, within two days of writing it' })
	@ApiQuery({ name: 't', required: false, description: 'Signed link from the invitation email' })
	async update(
		@GetOptionalUserId() userId: string | undefined,
		@Param('bookingId') bookingId: string,
		@Body(new ZodValidationPipe(UpdateReviewSchema)) data: UpdateReviewData,
		@Query('t') token?: string,
	) {
		const actorId = await this.reviewService.resolveActor(bookingId, userId, token);

		return this.reviewService.updateForBooking(actorId, bookingId, data);
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
