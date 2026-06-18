import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingReferenceCountOrderByAggregateInputSchema: z.ZodType<Prisma.BookingReferenceCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default BookingReferenceCountOrderByAggregateInputSchema;
