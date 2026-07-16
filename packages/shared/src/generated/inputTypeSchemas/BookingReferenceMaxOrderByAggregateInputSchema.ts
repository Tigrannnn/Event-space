import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingReferenceMaxOrderByAggregateInputSchema: z.ZodType<Prisma.BookingReferenceMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export default BookingReferenceMaxOrderByAggregateInputSchema;
