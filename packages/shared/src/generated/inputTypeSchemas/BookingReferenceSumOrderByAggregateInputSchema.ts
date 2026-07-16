import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingReferenceSumOrderByAggregateInputSchema: z.ZodType<Prisma.BookingReferenceSumOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
});

export default BookingReferenceSumOrderByAggregateInputSchema;
