import { z } from 'zod';

/////////////////////////////////////////
// REVIEW IMAGE SCHEMA
/////////////////////////////////////////

/**
 * Фото к отзыву. Показываются вместе с ним, после проверки.
 */
export const ReviewImageSchema = z.object({
  id: z.uuid(),
  reviewId: z.string(),
  url: z.string(),
  publicId: z.string(),
  order: z.number().int(),
  createdAt: z.coerce.date(),
})

export type ReviewImage = z.infer<typeof ReviewImageSchema>

export default ReviewImageSchema;
