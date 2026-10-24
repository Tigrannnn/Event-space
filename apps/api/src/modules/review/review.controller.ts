import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { CreateReviewSchema, UpdateReviewSchema } from '@event-space/shared';
import type { CreateReviewData, UpdateReviewData } from '@event-space/shared';
import { BOOKING_CONFIG } from '@event-space/shared/constants';
import { GetCurrentUserId, parseOptionalQueryInt, ZodValidationPipe } from '@shared';
import { AccessTokenGuard } from '@modules/auth/guards/access-token.guard';
import { RateLimiterService } from '@infra/rate-limiter/rate-limiter.service';
import { ReviewService } from './review.service';

@ApiTags('reviews')
@Controller()
export class ReviewController {
	constructor(
		private readonly reviewService: ReviewService,
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
}
