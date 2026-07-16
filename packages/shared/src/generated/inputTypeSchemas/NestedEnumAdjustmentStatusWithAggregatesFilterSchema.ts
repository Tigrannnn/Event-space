import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdjustmentStatusSchema } from './AdjustmentStatusSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumAdjustmentStatusFilterSchema } from './NestedEnumAdjustmentStatusFilterSchema';

export const NestedEnumAdjustmentStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumAdjustmentStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => AdjustmentStatusSchema).optional(),
  in: z.lazy(() => AdjustmentStatusSchema).array().optional(),
  notIn: z.lazy(() => AdjustmentStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => AdjustmentStatusSchema), z.lazy(() => NestedEnumAdjustmentStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumAdjustmentStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumAdjustmentStatusFilterSchema).optional(),
});

export default NestedEnumAdjustmentStatusWithAggregatesFilterSchema;
