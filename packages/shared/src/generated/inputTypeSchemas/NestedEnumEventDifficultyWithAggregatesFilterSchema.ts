import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventDifficultySchema } from './EventDifficultySchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumEventDifficultyFilterSchema } from './NestedEnumEventDifficultyFilterSchema';

export const NestedEnumEventDifficultyWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumEventDifficultyWithAggregatesFilter> = z.object({
  equals: z.lazy(() => EventDifficultySchema).optional(),
  in: z.lazy(() => EventDifficultySchema).array().optional(),
  notIn: z.lazy(() => EventDifficultySchema).array().optional(),
  not: z.union([ z.lazy(() => EventDifficultySchema), z.lazy(() => NestedEnumEventDifficultyWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumEventDifficultyFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumEventDifficultyFilterSchema).optional(),
}).strict();

export default NestedEnumEventDifficultyWithAggregatesFilterSchema;
