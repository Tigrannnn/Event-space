import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusSchema } from './BookingStatusSchema';

export const BookingCreateManyUserInputSchema: z.ZodType<Prisma.BookingCreateManyUserInput> = z.object({
  id: z.uuid().optional(),
  eventId: z.string(),
  status: z.lazy(() => BookingStatusSchema).optional(),
  quantity: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  paymentIntentId: z.string().optional().nullable(),
}).strict();

export default BookingCreateManyUserInputSchema;
