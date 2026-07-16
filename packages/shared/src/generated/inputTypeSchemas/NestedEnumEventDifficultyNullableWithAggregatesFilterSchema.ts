import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventDifficultySchema } from './EventDifficultySchema';
import { NestedIntNullableFilterSchema } from './NestedIntNullableFilterSchema';
import { NestedEnumEventDifficultyNullableFilterSchema } from './NestedEnumEventDifficultyNullableFilterSchema';

export const NestedEnumEventDifficultyNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumEventDifficultyNullableWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => EventDifficultySchema).optional().nullable(),
  in: z.lazy(() => EventDifficultySchema).array().optional().nullable(),
  notIn: z.lazy(() => EventDifficultySchema).array().optional().nullable(),
  not: z.union([ z.lazy(() => EventDifficultySchema), z.lazy(() => NestedEnumEventDifficultyNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumEventDifficultyNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumEventDifficultyNullableFilterSchema).optional(),
});

export default NestedEnumEventDifficultyNullableWithAggregatesFilterSchema;
