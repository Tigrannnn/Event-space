import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventStatusSchema } from './EventStatusSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumEventStatusFilterSchema } from './NestedEnumEventStatusFilterSchema';

export const NestedEnumEventStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumEventStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => EventStatusSchema).optional(),
  in: z.lazy(() => EventStatusSchema).array().optional(),
  notIn: z.lazy(() => EventStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => EventStatusSchema), z.lazy(() => NestedEnumEventStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumEventStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumEventStatusFilterSchema).optional(),
});

export default NestedEnumEventStatusWithAggregatesFilterSchema;
