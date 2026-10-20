import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModificationStatusSchema } from './ModificationStatusSchema';

export const NestedEnumModificationStatusFilterSchema: z.ZodType<Prisma.NestedEnumModificationStatusFilter> = z.strictObject({
  equals: z.lazy(() => ModificationStatusSchema).optional(),
  in: z.lazy(() => ModificationStatusSchema).array().optional(),
  notIn: z.lazy(() => ModificationStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ModificationStatusSchema), z.lazy(() => NestedEnumModificationStatusFilterSchema) ]).optional(),
});

export default NestedEnumModificationStatusFilterSchema;
