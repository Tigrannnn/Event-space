import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { BookingStatusHistoryCountOrderByAggregateInputSchema } from './BookingStatusHistoryCountOrderByAggregateInputSchema';
import { BookingStatusHistoryAvgOrderByAggregateInputSchema } from './BookingStatusHistoryAvgOrderByAggregateInputSchema';
import { BookingStatusHistoryMaxOrderByAggregateInputSchema } from './BookingStatusHistoryMaxOrderByAggregateInputSchema';
import { BookingStatusHistoryMinOrderByAggregateInputSchema } from './BookingStatusHistoryMinOrderByAggregateInputSchema';
import { BookingStatusHistorySumOrderByAggregateInputSchema } from './BookingStatusHistorySumOrderByAggregateInputSchema';

export const BookingStatusHistoryOrderByWithAggregationInputSchema: z.ZodType<Prisma.BookingStatusHistoryOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  bookingId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  validFrom: z.lazy(() => SortOrderSchema).optional(),
  validTo: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => BookingStatusHistoryCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => BookingStatusHistoryAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => BookingStatusHistoryMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => BookingStatusHistoryMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => BookingStatusHistorySumOrderByAggregateInputSchema).optional(),
});

export default BookingStatusHistoryOrderByWithAggregationInputSchema;
