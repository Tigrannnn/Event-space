import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { OutboxStatusSchema } from './OutboxStatusSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumOutboxStatusFilterSchema } from './NestedEnumOutboxStatusFilterSchema';

export const NestedEnumOutboxStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumOutboxStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => OutboxStatusSchema).optional(),
  in: z.lazy(() => OutboxStatusSchema).array().optional(),
  notIn: z.lazy(() => OutboxStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => OutboxStatusSchema), z.lazy(() => NestedEnumOutboxStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumOutboxStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumOutboxStatusFilterSchema).optional(),
}).strict();

export default NestedEnumOutboxStatusWithAggregatesFilterSchema;
