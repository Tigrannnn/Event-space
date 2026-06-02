import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdjustmentTypeSchema } from './AdjustmentTypeSchema';
import { NestedEnumAdjustmentTypeFilterSchema } from './NestedEnumAdjustmentTypeFilterSchema';

export const EnumAdjustmentTypeFilterSchema: z.ZodType<Prisma.EnumAdjustmentTypeFilter> = z.object({
  equals: z.lazy(() => AdjustmentTypeSchema).optional(),
  in: z.lazy(() => AdjustmentTypeSchema).array().optional(),
  notIn: z.lazy(() => AdjustmentTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => AdjustmentTypeSchema), z.lazy(() => NestedEnumAdjustmentTypeFilterSchema) ]).optional(),
}).strict();

export default EnumAdjustmentTypeFilterSchema;
