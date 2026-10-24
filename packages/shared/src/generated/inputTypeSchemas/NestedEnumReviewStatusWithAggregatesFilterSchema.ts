import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewStatusSchema } from './ReviewStatusSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumReviewStatusFilterSchema } from './NestedEnumReviewStatusFilterSchema';

export const NestedEnumReviewStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumReviewStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => ReviewStatusSchema).optional(),
  in: z.lazy(() => ReviewStatusSchema).array().optional(),
  notIn: z.lazy(() => ReviewStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ReviewStatusSchema), z.lazy(() => NestedEnumReviewStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumReviewStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumReviewStatusFilterSchema).optional(),
});

export default NestedEnumReviewStatusWithAggregatesFilterSchema;
