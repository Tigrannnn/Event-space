import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingAdjustmentAvgOrderByAggregateInputSchema: z.ZodType<Prisma.BookingAdjustmentAvgOrderByAggregateInput> = z.strictObject({
  amount: z.lazy(() => SortOrderSchema).optional(),
});

export default BookingAdjustmentAvgOrderByAggregateInputSchema;
