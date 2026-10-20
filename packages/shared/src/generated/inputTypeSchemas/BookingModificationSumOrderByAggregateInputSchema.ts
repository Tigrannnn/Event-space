import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingModificationSumOrderByAggregateInputSchema: z.ZodType<Prisma.BookingModificationSumOrderByAggregateInput> = z.strictObject({
  fromQuantity: z.lazy(() => SortOrderSchema).optional(),
  toQuantity: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
});

export default BookingModificationSumOrderByAggregateInputSchema;
