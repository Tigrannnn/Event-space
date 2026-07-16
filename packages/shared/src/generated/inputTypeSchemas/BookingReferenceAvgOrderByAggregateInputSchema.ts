import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingReferenceAvgOrderByAggregateInputSchema: z.ZodType<Prisma.BookingReferenceAvgOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
});

export default BookingReferenceAvgOrderByAggregateInputSchema;
