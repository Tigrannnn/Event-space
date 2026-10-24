import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewCreateManyUserInputSchema } from './ReviewCreateManyUserInputSchema';

export const ReviewCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.ReviewCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => ReviewCreateManyUserInputSchema), z.lazy(() => ReviewCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export default ReviewCreateManyUserInputEnvelopeSchema;
