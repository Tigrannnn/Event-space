import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingAdjustmentOrderByRelationAggregateInputSchema: z.ZodType<Prisma.BookingAdjustmentOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export default BookingAdjustmentOrderByRelationAggregateInputSchema;
