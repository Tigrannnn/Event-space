import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModificationStatusSchema } from './ModificationStatusSchema';
import { NestedEnumModificationStatusFilterSchema } from './NestedEnumModificationStatusFilterSchema';

export const EnumModificationStatusFilterSchema: z.ZodType<Prisma.EnumModificationStatusFilter> = z.strictObject({
  equals: z.lazy(() => ModificationStatusSchema).optional(),
  in: z.lazy(() => ModificationStatusSchema).array().optional(),
  notIn: z.lazy(() => ModificationStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ModificationStatusSchema), z.lazy(() => NestedEnumModificationStatusFilterSchema) ]).optional(),
});

export default EnumModificationStatusFilterSchema;
