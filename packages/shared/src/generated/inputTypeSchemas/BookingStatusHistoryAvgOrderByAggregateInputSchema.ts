import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingStatusHistoryAvgOrderByAggregateInputSchema: z.ZodType<Prisma.BookingStatusHistoryAvgOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
});

export default BookingStatusHistoryAvgOrderByAggregateInputSchema;
