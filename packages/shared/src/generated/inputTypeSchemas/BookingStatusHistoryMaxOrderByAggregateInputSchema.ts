import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingStatusHistoryMaxOrderByAggregateInputSchema: z.ZodType<Prisma.BookingStatusHistoryMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  bookingId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  validFrom: z.lazy(() => SortOrderSchema).optional(),
  validTo: z.lazy(() => SortOrderSchema).optional(),
});

export default BookingStatusHistoryMaxOrderByAggregateInputSchema;
