import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdjustmentStatusSchema } from './AdjustmentStatusSchema';
import { NestedEnumAdjustmentStatusFilterSchema } from './NestedEnumAdjustmentStatusFilterSchema';

export const EnumAdjustmentStatusFilterSchema: z.ZodType<Prisma.EnumAdjustmentStatusFilter> = z.strictObject({
  equals: z.lazy(() => AdjustmentStatusSchema).optional(),
  in: z.lazy(() => AdjustmentStatusSchema).array().optional(),
  notIn: z.lazy(() => AdjustmentStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => AdjustmentStatusSchema), z.lazy(() => NestedEnumAdjustmentStatusFilterSchema) ]).optional(),
});

export default EnumAdjustmentStatusFilterSchema;
