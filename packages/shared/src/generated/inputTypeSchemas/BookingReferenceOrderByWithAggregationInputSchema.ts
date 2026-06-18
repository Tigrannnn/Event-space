import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { BookingReferenceCountOrderByAggregateInputSchema } from './BookingReferenceCountOrderByAggregateInputSchema';
import { BookingReferenceAvgOrderByAggregateInputSchema } from './BookingReferenceAvgOrderByAggregateInputSchema';
import { BookingReferenceMaxOrderByAggregateInputSchema } from './BookingReferenceMaxOrderByAggregateInputSchema';
import { BookingReferenceMinOrderByAggregateInputSchema } from './BookingReferenceMinOrderByAggregateInputSchema';
import { BookingReferenceSumOrderByAggregateInputSchema } from './BookingReferenceSumOrderByAggregateInputSchema';

export const BookingReferenceOrderByWithAggregationInputSchema: z.ZodType<Prisma.BookingReferenceOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => BookingReferenceCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => BookingReferenceAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => BookingReferenceMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => BookingReferenceMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => BookingReferenceSumOrderByAggregateInputSchema).optional(),
}).strict();

export default BookingReferenceOrderByWithAggregationInputSchema;
