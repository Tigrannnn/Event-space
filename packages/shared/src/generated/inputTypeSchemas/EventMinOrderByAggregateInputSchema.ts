import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const EventMinOrderByAggregateInputSchema: z.ZodType<Prisma.EventMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  locationUrl: z.lazy(() => SortOrderSchema).optional(),
  meetingLocationUrl: z.lazy(() => SortOrderSchema).optional(),
  difficulty: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  duration: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  categoryId: z.lazy(() => SortOrderSchema).optional(),
});

export default EventMinOrderByAggregateInputSchema;
