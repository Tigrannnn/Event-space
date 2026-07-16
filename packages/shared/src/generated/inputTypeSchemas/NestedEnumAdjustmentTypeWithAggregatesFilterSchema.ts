import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdjustmentTypeSchema } from './AdjustmentTypeSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumAdjustmentTypeFilterSchema } from './NestedEnumAdjustmentTypeFilterSchema';

export const NestedEnumAdjustmentTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumAdjustmentTypeWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => AdjustmentTypeSchema).optional(),
  in: z.lazy(() => AdjustmentTypeSchema).array().optional(),
  notIn: z.lazy(() => AdjustmentTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => AdjustmentTypeSchema), z.lazy(() => NestedEnumAdjustmentTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumAdjustmentTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumAdjustmentTypeFilterSchema).optional(),
});

export default NestedEnumAdjustmentTypeWithAggregatesFilterSchema;
