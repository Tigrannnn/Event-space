import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewWhereInputSchema } from './ReviewWhereInputSchema';

export const ReviewListRelationFilterSchema: z.ZodType<Prisma.ReviewListRelationFilter> = z.strictObject({
  every: z.lazy(() => ReviewWhereInputSchema).optional(),
  some: z.lazy(() => ReviewWhereInputSchema).optional(),
  none: z.lazy(() => ReviewWhereInputSchema).optional(),
});

export default ReviewListRelationFilterSchema;
