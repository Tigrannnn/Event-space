import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventDifficultySchema } from './EventDifficultySchema';
import { NestedEnumEventDifficultyNullableFilterSchema } from './NestedEnumEventDifficultyNullableFilterSchema';

export const EnumEventDifficultyNullableFilterSchema: z.ZodType<Prisma.EnumEventDifficultyNullableFilter> = z.object({
  equals: z.lazy(() => EventDifficultySchema).optional().nullable(),
  in: z.lazy(() => EventDifficultySchema).array().optional().nullable(),
  notIn: z.lazy(() => EventDifficultySchema).array().optional().nullable(),
  not: z.union([ z.lazy(() => EventDifficultySchema), z.lazy(() => NestedEnumEventDifficultyNullableFilterSchema) ]).optional().nullable(),
}).strict();

export default EnumEventDifficultyNullableFilterSchema;
