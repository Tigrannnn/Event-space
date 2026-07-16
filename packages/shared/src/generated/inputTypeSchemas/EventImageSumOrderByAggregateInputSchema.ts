import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const EventImageSumOrderByAggregateInputSchema: z.ZodType<Prisma.EventImageSumOrderByAggregateInput> = z.strictObject({
  order: z.lazy(() => SortOrderSchema).optional(),
});

export default EventImageSumOrderByAggregateInputSchema;
