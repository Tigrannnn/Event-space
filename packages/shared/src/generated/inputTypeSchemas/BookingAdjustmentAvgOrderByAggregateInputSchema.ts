import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingAdjustmentAvgOrderByAggregateInputSchema: z.ZodType<Prisma.BookingAdjustmentAvgOrderByAggregateInput> = z.object({
  amount: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default BookingAdjustmentAvgOrderByAggregateInputSchema;
