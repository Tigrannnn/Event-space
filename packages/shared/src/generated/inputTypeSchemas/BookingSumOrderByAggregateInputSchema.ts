import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingSumOrderByAggregateInputSchema: z.ZodType<Prisma.BookingSumOrderByAggregateInput> = z.strictObject({
  quantity: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  referenceNumber: z.lazy(() => SortOrderSchema).optional(),
});

export default BookingSumOrderByAggregateInputSchema;
