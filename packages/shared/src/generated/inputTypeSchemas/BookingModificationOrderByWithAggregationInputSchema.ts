import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { BookingModificationCountOrderByAggregateInputSchema } from './BookingModificationCountOrderByAggregateInputSchema';
import { BookingModificationAvgOrderByAggregateInputSchema } from './BookingModificationAvgOrderByAggregateInputSchema';
import { BookingModificationMaxOrderByAggregateInputSchema } from './BookingModificationMaxOrderByAggregateInputSchema';
import { BookingModificationMinOrderByAggregateInputSchema } from './BookingModificationMinOrderByAggregateInputSchema';
import { BookingModificationSumOrderByAggregateInputSchema } from './BookingModificationSumOrderByAggregateInputSchema';

export const BookingModificationOrderByWithAggregationInputSchema: z.ZodType<Prisma.BookingModificationOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  bookingId: z.lazy(() => SortOrderSchema).optional(),
  fromQuantity: z.lazy(() => SortOrderSchema).optional(),
  toQuantity: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  paymentIntentId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  failureReason: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  appliedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => BookingModificationCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => BookingModificationAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => BookingModificationMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => BookingModificationMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => BookingModificationSumOrderByAggregateInputSchema).optional(),
});

export default BookingModificationOrderByWithAggregationInputSchema;
