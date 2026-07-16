import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { BookingAdjustmentCountOrderByAggregateInputSchema } from './BookingAdjustmentCountOrderByAggregateInputSchema';
import { BookingAdjustmentAvgOrderByAggregateInputSchema } from './BookingAdjustmentAvgOrderByAggregateInputSchema';
import { BookingAdjustmentMaxOrderByAggregateInputSchema } from './BookingAdjustmentMaxOrderByAggregateInputSchema';
import { BookingAdjustmentMinOrderByAggregateInputSchema } from './BookingAdjustmentMinOrderByAggregateInputSchema';
import { BookingAdjustmentSumOrderByAggregateInputSchema } from './BookingAdjustmentSumOrderByAggregateInputSchema';

export const BookingAdjustmentOrderByWithAggregationInputSchema: z.ZodType<Prisma.BookingAdjustmentOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  bookingId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  currency: z.lazy(() => SortOrderSchema).optional(),
  stripePaymentIntentId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  stripeRefundId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  reason: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => BookingAdjustmentCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => BookingAdjustmentAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => BookingAdjustmentMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => BookingAdjustmentMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => BookingAdjustmentSumOrderByAggregateInputSchema).optional(),
});

export default BookingAdjustmentOrderByWithAggregationInputSchema;
