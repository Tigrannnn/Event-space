import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingStatusHistoryOrderByRelationAggregateInputSchema: z.ZodType<Prisma.BookingStatusHistoryOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export default BookingStatusHistoryOrderByRelationAggregateInputSchema;
