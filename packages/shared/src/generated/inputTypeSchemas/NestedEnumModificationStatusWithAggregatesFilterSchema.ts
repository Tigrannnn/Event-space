import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModificationStatusSchema } from './ModificationStatusSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumModificationStatusFilterSchema } from './NestedEnumModificationStatusFilterSchema';

export const NestedEnumModificationStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumModificationStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => ModificationStatusSchema).optional(),
  in: z.lazy(() => ModificationStatusSchema).array().optional(),
  notIn: z.lazy(() => ModificationStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ModificationStatusSchema), z.lazy(() => NestedEnumModificationStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumModificationStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumModificationStatusFilterSchema).optional(),
});

export default NestedEnumModificationStatusWithAggregatesFilterSchema;
