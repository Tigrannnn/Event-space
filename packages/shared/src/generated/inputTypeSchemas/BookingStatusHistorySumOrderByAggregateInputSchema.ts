import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingStatusHistorySumOrderByAggregateInputSchema: z.ZodType<Prisma.BookingStatusHistorySumOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
});

export default BookingStatusHistorySumOrderByAggregateInputSchema;
