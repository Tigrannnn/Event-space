import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const EventImageOrderByRelationAggregateInputSchema: z.ZodType<Prisma.EventImageOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export default EventImageOrderByRelationAggregateInputSchema;
