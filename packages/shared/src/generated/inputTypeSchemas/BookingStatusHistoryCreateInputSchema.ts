import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusSchema } from './BookingStatusSchema';
import { BookingCreateNestedOneWithoutStatusHistoryInputSchema } from './BookingCreateNestedOneWithoutStatusHistoryInputSchema';

export const BookingStatusHistoryCreateInputSchema: z.ZodType<Prisma.BookingStatusHistoryCreateInput> = z.strictObject({
  status: z.lazy(() => BookingStatusSchema),
  validFrom: z.coerce.date().optional(),
  validTo: z.coerce.date().optional().nullable(),
  booking: z.lazy(() => BookingCreateNestedOneWithoutStatusHistoryInputSchema),
});

export default BookingStatusHistoryCreateInputSchema;
