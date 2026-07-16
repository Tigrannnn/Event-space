import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventDifficultySchema } from './EventDifficultySchema';

export const NestedEnumEventDifficultyNullableFilterSchema: z.ZodType<Prisma.NestedEnumEventDifficultyNullableFilter> = z.strictObject({
  equals: z.lazy(() => EventDifficultySchema).optional().nullable(),
  in: z.lazy(() => EventDifficultySchema).array().optional().nullable(),
  notIn: z.lazy(() => EventDifficultySchema).array().optional().nullable(),
  not: z.union([ z.lazy(() => EventDifficultySchema), z.lazy(() => NestedEnumEventDifficultyNullableFilterSchema) ]).optional().nullable(),
});

export default NestedEnumEventDifficultyNullableFilterSchema;
