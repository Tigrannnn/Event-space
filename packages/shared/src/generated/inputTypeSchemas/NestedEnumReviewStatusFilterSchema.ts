import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewStatusSchema } from './ReviewStatusSchema';

export const NestedEnumReviewStatusFilterSchema: z.ZodType<Prisma.NestedEnumReviewStatusFilter> = z.strictObject({
  equals: z.lazy(() => ReviewStatusSchema).optional(),
  in: z.lazy(() => ReviewStatusSchema).array().optional(),
  notIn: z.lazy(() => ReviewStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ReviewStatusSchema), z.lazy(() => NestedEnumReviewStatusFilterSchema) ]).optional(),
});

export default NestedEnumReviewStatusFilterSchema;
