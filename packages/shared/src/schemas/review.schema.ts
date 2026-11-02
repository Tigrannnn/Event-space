import { z } from './openapi';
import { ReviewSchema as GeneratedReviewSchema } from '../generated/modelSchema/ReviewSchema';
import { ReviewStatusSchema } from '../generated/inputTypeSchemas/ReviewStatusSchema';
import { ReviewSourceSchema } from '../generated/inputTypeSchemas/ReviewSourceSchema';
import { REVIEW_CONFIG } from '../constants/review.constant';
import { EventTranslationSchema } from './event-translation.schema';

export const ReviewSourceEnum = ReviewSourceSchema;
export type ReviewSource = z.infer<typeof ReviewSourceEnum>;

/** The places a review can be brought in from; our own is not among them. */
export const IMPORTABLE_REVIEW_SOURCES = ReviewSourceEnum.options.filter(
	(source) => source !== 'PLATFORM',
);

export const ReviewStatusEnum = ReviewStatusSchema;
export type ReviewStatus = z.infer<typeof ReviewStatusEnum>;

/** The author as the page shows them: a name, never an email or a phone. */
export const ReviewAuthorSchema = z.object({
	id: z.string(),
	name: z.string(),
	image: z.string().nullish(),
});

/** A photo of a review as the page shows it: where to find it, never how it is stored. */
export const ReviewImageSchema = z.object({
	id: z.string(),
	url: z.string(),
	order: z.number().int(),
});

export type ReviewImage = z.infer<typeof ReviewImageSchema>;

export const ReviewSchema = GeneratedReviewSchema.extend({
	user: ReviewAuthorSchema.nullish(),
	images: z.array(ReviewImageSchema).default([]),
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
		/** On an edit: the photos already on the review that stay. The rest are removed. */
		keepImageIds: z.array(z.string()).max(REVIEW_CONFIG.MAX_IMAGES).optional(),
	})
	.openapi({ description: 'A rating, and optionally a few words and photos' });

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

/** A review written somewhere else, entered by hand with where it came from. */
export const ImportReviewSchema = z
	.object({
		eventId: z.string().min(1),
		authorName: z.string().trim().min(1).max(REVIEW_CONFIG.AUTHOR_NAME_MAX),
		rating: RatingSchema,
		text: z.string().trim().max(REVIEW_CONFIG.TEXT_MAX).nullish(),
		source: z.enum(IMPORTABLE_REVIEW_SOURCES as [ReviewSource, ...ReviewSource[]]),
		/** The name of the site, for a source that is not on the list. */
		sourceName: z.string().trim().max(REVIEW_CONFIG.SOURCE_NAME_MAX).nullish(),
		/** When it was written there. Today when left out. */
		reviewedAt: z.coerce.date().nullish(),
	})
	.refine((data) => data.source !== 'OTHER' || Boolean(data.sourceName), {
		path: ['sourceName'],
		message: 'Name the site the review was written on',
	})
	.openapi({ description: 'A review brought in by hand from another site' });

export type ImportReviewData = z.infer<typeof ImportReviewSchema>;

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
