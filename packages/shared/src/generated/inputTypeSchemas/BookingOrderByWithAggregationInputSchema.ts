import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { BookingCountOrderByAggregateInputSchema } from './BookingCountOrderByAggregateInputSchema';
import { BookingAvgOrderByAggregateInputSchema } from './BookingAvgOrderByAggregateInputSchema';
import { BookingMaxOrderByAggregateInputSchema } from './BookingMaxOrderByAggregateInputSchema';
import { BookingMinOrderByAggregateInputSchema } from './BookingMinOrderByAggregateInputSchema';
import { BookingSumOrderByAggregateInputSchema } from './BookingSumOrderByAggregateInputSchema';

export const BookingOrderByWithAggregationInputSchema: z.ZodType<Prisma.BookingOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  eventId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  paymentMethod: z.lazy(() => SortOrderSchema).optional(),
  createdByAdminId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  paymentIntentId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => BookingCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => BookingAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => BookingMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => BookingMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => BookingSumOrderByAggregateInputSchema).optional(),
}).strict();

export default BookingOrderByWithAggregationInputSchema;
