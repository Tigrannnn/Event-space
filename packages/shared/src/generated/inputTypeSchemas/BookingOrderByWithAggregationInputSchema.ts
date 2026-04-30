import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { BookingCountOrderByAggregateInputSchema } from './BookingCountOrderByAggregateInputSchema';
import { BookingMaxOrderByAggregateInputSchema } from './BookingMaxOrderByAggregateInputSchema';
import { BookingMinOrderByAggregateInputSchema } from './BookingMinOrderByAggregateInputSchema';

export const BookingOrderByWithAggregationInputSchema: z.ZodType<Prisma.BookingOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  eventId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => BookingCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => BookingMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => BookingMinOrderByAggregateInputSchema).optional(),
}).strict();

export default BookingOrderByWithAggregationInputSchema;
