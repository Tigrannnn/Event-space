import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusSchema } from './BookingStatusSchema';

export const BookingUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.BookingUncheckedCreateWithoutUserInput> = z.object({
  id: z.uuid().optional(),
  eventId: z.string(),
  status: z.lazy(() => BookingStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}).strict();

export default BookingUncheckedCreateWithoutUserInputSchema;
