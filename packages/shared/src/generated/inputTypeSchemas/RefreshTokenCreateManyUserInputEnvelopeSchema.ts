import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RefreshTokenCreateManyUserInputSchema } from './RefreshTokenCreateManyUserInputSchema';

export const RefreshTokenCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.RefreshTokenCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => RefreshTokenCreateManyUserInputSchema), z.lazy(() => RefreshTokenCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export default RefreshTokenCreateManyUserInputEnvelopeSchema;
