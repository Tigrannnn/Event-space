import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdjustmentTypeSchema } from './AdjustmentTypeSchema';

export const NestedEnumAdjustmentTypeFilterSchema: z.ZodType<Prisma.NestedEnumAdjustmentTypeFilter> = z.strictObject({
  equals: z.lazy(() => AdjustmentTypeSchema).optional(),
  in: z.lazy(() => AdjustmentTypeSchema).array().optional(),
  notIn: z.lazy(() => AdjustmentTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => AdjustmentTypeSchema), z.lazy(() => NestedEnumAdjustmentTypeFilterSchema) ]).optional(),
});

export default NestedEnumAdjustmentTypeFilterSchema;
