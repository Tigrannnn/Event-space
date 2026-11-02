import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { BookingStatusSchema } from '../inputTypeSchemas/BookingStatusSchema'
import { PaymentMethodSchema } from '../inputTypeSchemas/PaymentMethodSchema'
import { BookingChannelSchema } from '../inputTypeSchemas/BookingChannelSchema'

/////////////////////////////////////////
// BOOKING SCHEMA
/////////////////////////////////////////

export const BookingSchema = z.object({
  status: BookingStatusSchema,
  paymentMethod: PaymentMethodSchema,
  channel: BookingChannelSchema,
  id: z.uuid(),
  userId: z.string(),
  occurrenceId: z.string(),
  quantity: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'Booking']"}),
  baseAmount: z.instanceof(Prisma.Decimal, { message: "Field 'baseAmount' must be a Decimal. Location: ['Models', 'Booking']"}).nullable(),
  discountPercent: z.number().int().nullable(),
  promoCodeId: z.string().nullable(),
  /**
   * Номер брони на площадке. Вместе с каналом не повторяется: одну и ту же бронь не внести дважды.
   */
  externalId: z.string().nullable(),
  createdByAdminId: z.string().nullable(),
  rescheduleRefundUntil: z.coerce.date().nullable(),
  rescheduleAcceptedAt: z.coerce.date().nullable(),
  /**
   * Хост сайта, на котором сделана бронь: по нему письма берут бренд компании.
   */
  brandHost: z.string().nullable(),
  paymentIntentId: z.string().nullable(),
  referenceNumber: z.number().int().nullable(),
  checkedInAt: z.coerce.date().nullable(),
  confirmationSentAt: z.coerce.date().nullable(),
  reminderSentAt: z.coerce.date().nullable(),
  reviewInviteSentAt: z.coerce.date().nullable(),
})

export type Booking = z.infer<typeof BookingSchema>

export default BookingSchema;
