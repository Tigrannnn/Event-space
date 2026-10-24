import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewCreateManyEventInputSchema } from './ReviewCreateManyEventInputSchema';

export const ReviewCreateManyEventInputEnvelopeSchema: z.ZodType<Prisma.ReviewCreateManyEventInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => ReviewCreateManyEventInputSchema), z.lazy(() => ReviewCreateManyEventInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export default ReviewCreateManyEventInputEnvelopeSchema;
