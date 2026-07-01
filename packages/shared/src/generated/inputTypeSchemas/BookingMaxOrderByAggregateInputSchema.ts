import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingMaxOrderByAggregateInputSchema: z.ZodType<Prisma.BookingMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  occurrenceId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  paymentMethod: z.lazy(() => SortOrderSchema).optional(),
  createdByAdminId: z.lazy(() => SortOrderSchema).optional(),
  paymentIntentId: z.lazy(() => SortOrderSchema).optional(),
  referenceNumber: z.lazy(() => SortOrderSchema).optional(),
  checkedInAt: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default BookingMaxOrderByAggregateInputSchema;
