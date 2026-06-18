import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingAvgOrderByAggregateInputSchema: z.ZodType<Prisma.BookingAvgOrderByAggregateInput> = z.object({
  quantity: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  referenceNumber: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default BookingAvgOrderByAggregateInputSchema;
