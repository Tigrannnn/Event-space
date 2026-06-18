import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingReferenceMaxOrderByAggregateInputSchema: z.ZodType<Prisma.BookingReferenceMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default BookingReferenceMaxOrderByAggregateInputSchema;
