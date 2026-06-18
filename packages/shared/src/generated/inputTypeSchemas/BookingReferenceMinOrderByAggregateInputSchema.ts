import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingReferenceMinOrderByAggregateInputSchema: z.ZodType<Prisma.BookingReferenceMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default BookingReferenceMinOrderByAggregateInputSchema;
