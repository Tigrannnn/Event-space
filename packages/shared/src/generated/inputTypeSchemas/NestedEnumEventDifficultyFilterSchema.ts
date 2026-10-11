import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventDifficultySchema } from './EventDifficultySchema';

export const NestedEnumEventDifficultyFilterSchema: z.ZodType<Prisma.NestedEnumEventDifficultyFilter> = z.strictObject({
  equals: z.lazy(() => EventDifficultySchema).optional(),
  in: z.lazy(() => EventDifficultySchema).array().optional(),
  notIn: z.lazy(() => EventDifficultySchema).array().optional(),
  not: z.union([ z.lazy(() => EventDifficultySchema), z.lazy(() => NestedEnumEventDifficultyFilterSchema) ]).optional(),
});

export default NestedEnumEventDifficultyFilterSchema;
