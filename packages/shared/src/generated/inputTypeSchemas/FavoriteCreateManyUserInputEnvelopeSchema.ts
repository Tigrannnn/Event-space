import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { FavoriteCreateManyUserInputSchema } from './FavoriteCreateManyUserInputSchema';

export const FavoriteCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.FavoriteCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => FavoriteCreateManyUserInputSchema), z.lazy(() => FavoriteCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export default FavoriteCreateManyUserInputEnvelopeSchema;
