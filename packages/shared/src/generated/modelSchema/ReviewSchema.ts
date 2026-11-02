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
   * У отзыва, внесённого вручную со стороннего сайта, нет ни брони, ни автора-пользователя.
   */
  bookingId: z.string().nullable(),
  eventId: z.string(),
  userId: z.string().nullable(),
  /**
   * Откуда отзыв. По умолчанию наш сайт (системный канал PLATFORM): написан гостем после брони.
   */
  channelId: z.string(),
  /**
   * Имя автора там, где отзыв был написан: у такого отзыва нет аккаунта у нас.
   */
  authorName: z.string().nullable(),
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
