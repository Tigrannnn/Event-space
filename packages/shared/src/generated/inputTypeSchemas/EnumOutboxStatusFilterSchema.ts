import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { OutboxStatusSchema } from './OutboxStatusSchema';
import { NestedEnumOutboxStatusFilterSchema } from './NestedEnumOutboxStatusFilterSchema';

export const EnumOutboxStatusFilterSchema: z.ZodType<Prisma.EnumOutboxStatusFilter> = z.object({
  equals: z.lazy(() => OutboxStatusSchema).optional(),
  in: z.lazy(() => OutboxStatusSchema).array().optional(),
  notIn: z.lazy(() => OutboxStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => OutboxStatusSchema), z.lazy(() => NestedEnumOutboxStatusFilterSchema) ]).optional(),
}).strict();

export default EnumOutboxStatusFilterSchema;
