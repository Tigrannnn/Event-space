import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingReferenceAvgOrderByAggregateInputSchema: z.ZodType<Prisma.BookingReferenceAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default BookingReferenceAvgOrderByAggregateInputSchema;
