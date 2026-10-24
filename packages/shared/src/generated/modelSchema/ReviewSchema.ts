import { z } from 'zod';
import { ReviewStatusSchema } from '../inputTypeSchemas/ReviewStatusSchema'

/////////////////////////////////////////
// REVIEW SCHEMA
/////////////////////////////////////////

export const ReviewSchema = z.object({
  status: ReviewStatusSchema,
  id: z.uuid(),
  /**
   * Одна бронь — один отзыв. Здесь вся защита от накрутки: чтобы написать,
   * надо было купить и съездить.
   */
  bookingId: z.string(),
  eventId: z.string(),
  userId: z.string(),
  rating: z.number().int(),
  text: z.string().nullable(),
  moderatedAt: z.coerce.date().nullable(),
  moderatedByAdminId: z.string().nullable(),
  rejectReason: z.string().nullable(),
  adminReply: z.string().nullable(),
  adminReplyAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Review = z.infer<typeof ReviewSchema>

export default ReviewSchema;
