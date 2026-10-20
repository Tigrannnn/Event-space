import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingModificationAvgOrderByAggregateInputSchema: z.ZodType<Prisma.BookingModificationAvgOrderByAggregateInput> = z.strictObject({
  fromQuantity: z.lazy(() => SortOrderSchema).optional(),
  toQuantity: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
});

export default BookingModificationAvgOrderByAggregateInputSchema;
