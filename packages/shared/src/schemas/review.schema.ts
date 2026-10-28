import { z } from './openapi';
import { ReviewSchema as GeneratedReviewSchema } from '../generated/modelSchema/ReviewSchema';
import { ReviewStatusSchema } from '../generated/inputTypeSchemas/ReviewStatusSchema';
import { REVIEW_CONFIG } from '../constants/review.constant';
import { EventTranslationSchema } from './event-translation.schema';

export const ReviewStatusEnum = ReviewStatusSchema;
export type ReviewStatus = z.infer<typeof ReviewStatusEnum>;

/** The author as the page shows them: a name, never an email or a phone. */
export const ReviewAuthorSchema = z.object({
	id: z.string(),
	name: z.string(),
	image: z.string().nullish(),
});

export const ReviewSchema = GeneratedReviewSchema.extend({
	user: ReviewAuthorSchema.nullish(),
});

export type Review = z.infer<typeof ReviewSchema>;

export const RatingSchema = z
	.number()
	.int()
	.min(REVIEW_CONFIG.MIN_RATING)
	.max(REVIEW_CONFIG.MAX_RATING);

export const CreateReviewSchema = z
	.object({
		rating: RatingSchema,
		text: z.string().trim().max(REVIEW_CONFIG.TEXT_MAX).nullish(),
	})
	.openapi({ description: 'A rating, and optionally a few words' });

export type CreateReviewData = z.infer<typeof CreateReviewSchema>;

export const UpdateReviewSchema = CreateReviewSchema;
export type UpdateReviewData = z.infer<typeof UpdateReviewSchema>;

/**
 * What the booking card needs to decide what to draw: the review if there is one, and
 * otherwise whether the button belongs there at all.
 */
export const ReviewWindowStateSchema = z.enum(['OPEN', 'TOO_EARLY', 'CLOSED', 'NOT_ELIGIBLE']);

export const MyReviewSchema = z.object({
	window: ReviewWindowStateSchema,
	opensAt: z.coerce.date().nullable(),
	review: ReviewSchema.nullable(),
	/** Enough to title the page without a second request for the whole event. */
	event: z
		.object({ id: z.string(), translations: z.array(EventTranslationSchema).default([]) })
		.nullable(),
	occurrenceDate: z.coerce.date().nullable(),
});

export type MyReview = z.infer<typeof MyReviewSchema>;

export const ModerateReviewSchema = z
	.object({
		action: z.enum(['PUBLISH', 'REJECT']),
		rejectReason: z.string().trim().max(REVIEW_CONFIG.REJECT_REASON_MAX).nullish(),
	})
	.openapi({ description: 'Admin decision on a pending review' });

export type ModerateReviewData = z.infer<typeof ModerateReviewSchema>;

export const ReplyToReviewSchema = z.object({
	reply: z.string().trim().max(REVIEW_CONFIG.ADMIN_REPLY_MAX).nullish(),
});

export type ReplyToReviewData = z.infer<typeof ReplyToReviewSchema>;
