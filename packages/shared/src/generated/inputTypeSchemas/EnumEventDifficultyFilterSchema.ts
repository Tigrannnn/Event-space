import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventDifficultySchema } from './EventDifficultySchema';
import { NestedEnumEventDifficultyFilterSchema } from './NestedEnumEventDifficultyFilterSchema';

export const EnumEventDifficultyFilterSchema: z.ZodType<Prisma.EnumEventDifficultyFilter> = z.object({
  equals: z.lazy(() => EventDifficultySchema).optional(),
  in: z.lazy(() => EventDifficultySchema).array().optional(),
  notIn: z.lazy(() => EventDifficultySchema).array().optional(),
  not: z.union([ z.lazy(() => EventDifficultySchema), z.lazy(() => NestedEnumEventDifficultyFilterSchema) ]).optional(),
}).strict();

export default EnumEventDifficultyFilterSchema;
