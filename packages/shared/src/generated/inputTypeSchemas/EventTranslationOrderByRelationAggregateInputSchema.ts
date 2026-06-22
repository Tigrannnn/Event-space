import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const EventTranslationOrderByRelationAggregateInputSchema: z.ZodType<Prisma.EventTranslationOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default EventTranslationOrderByRelationAggregateInputSchema;
