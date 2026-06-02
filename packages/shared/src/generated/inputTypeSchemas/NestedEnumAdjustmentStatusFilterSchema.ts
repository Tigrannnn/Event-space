import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdjustmentStatusSchema } from './AdjustmentStatusSchema';

export const NestedEnumAdjustmentStatusFilterSchema: z.ZodType<Prisma.NestedEnumAdjustmentStatusFilter> = z.object({
  equals: z.lazy(() => AdjustmentStatusSchema).optional(),
  in: z.lazy(() => AdjustmentStatusSchema).array().optional(),
  notIn: z.lazy(() => AdjustmentStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => AdjustmentStatusSchema), z.lazy(() => NestedEnumAdjustmentStatusFilterSchema) ]).optional(),
}).strict();

export default NestedEnumAdjustmentStatusFilterSchema;
