import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusSchema } from './BookingStatusSchema';

export const BookingUncheckedCreateInputSchema: z.ZodType<Prisma.BookingUncheckedCreateInput> = z.object({
  id: z.uuid().optional(),
  userId: z.string(),
  eventId: z.string(),
  status: z.lazy(() => BookingStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}).strict();

export default BookingUncheckedCreateInputSchema;
