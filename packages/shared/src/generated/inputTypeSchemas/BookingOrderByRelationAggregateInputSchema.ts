import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingOrderByRelationAggregateInputSchema: z.ZodType<Prisma.BookingOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default BookingOrderByRelationAggregateInputSchema;
