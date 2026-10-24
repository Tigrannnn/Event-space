import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewStatusSchema } from './ReviewStatusSchema';
import { NestedEnumReviewStatusFilterSchema } from './NestedEnumReviewStatusFilterSchema';

export const EnumReviewStatusFilterSchema: z.ZodType<Prisma.EnumReviewStatusFilter> = z.strictObject({
  equals: z.lazy(() => ReviewStatusSchema).optional(),
  in: z.lazy(() => ReviewStatusSchema).array().optional(),
  notIn: z.lazy(() => ReviewStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ReviewStatusSchema), z.lazy(() => NestedEnumReviewStatusFilterSchema) ]).optional(),
});

export default EnumReviewStatusFilterSchema;
