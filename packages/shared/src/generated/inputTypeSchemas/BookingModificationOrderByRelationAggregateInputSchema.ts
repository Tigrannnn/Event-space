import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingModificationOrderByRelationAggregateInputSchema: z.ZodType<Prisma.BookingModificationOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export default BookingModificationOrderByRelationAggregateInputSchema;
