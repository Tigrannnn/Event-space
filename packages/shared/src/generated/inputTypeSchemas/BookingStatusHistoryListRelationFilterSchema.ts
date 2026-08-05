import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusHistoryWhereInputSchema } from './BookingStatusHistoryWhereInputSchema';

export const BookingStatusHistoryListRelationFilterSchema: z.ZodType<Prisma.BookingStatusHistoryListRelationFilter> = z.strictObject({
  every: z.lazy(() => BookingStatusHistoryWhereInputSchema).optional(),
  some: z.lazy(() => BookingStatusHistoryWhereInputSchema).optional(),
  none: z.lazy(() => BookingStatusHistoryWhereInputSchema).optional(),
});

export default BookingStatusHistoryListRelationFilterSchema;
