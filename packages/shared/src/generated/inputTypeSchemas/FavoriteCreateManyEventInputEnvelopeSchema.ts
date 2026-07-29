import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { FavoriteCreateManyEventInputSchema } from './FavoriteCreateManyEventInputSchema';

export const FavoriteCreateManyEventInputEnvelopeSchema: z.ZodType<Prisma.FavoriteCreateManyEventInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => FavoriteCreateManyEventInputSchema), z.lazy(() => FavoriteCreateManyEventInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export default FavoriteCreateManyEventInputEnvelopeSchema;
