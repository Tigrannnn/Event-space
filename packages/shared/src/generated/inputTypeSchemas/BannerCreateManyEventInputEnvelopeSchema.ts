import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerCreateManyEventInputSchema } from './BannerCreateManyEventInputSchema';

export const BannerCreateManyEventInputEnvelopeSchema: z.ZodType<Prisma.BannerCreateManyEventInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => BannerCreateManyEventInputSchema), z.lazy(() => BannerCreateManyEventInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export default BannerCreateManyEventInputEnvelopeSchema;
