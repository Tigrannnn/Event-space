import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingAdjustmentOrderByRelationAggregateInputSchema: z.ZodType<Prisma.BookingAdjustmentOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default BookingAdjustmentOrderByRelationAggregateInputSchema;
