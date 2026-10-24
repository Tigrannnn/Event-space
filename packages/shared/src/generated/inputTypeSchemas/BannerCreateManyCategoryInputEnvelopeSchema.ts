import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerCreateManyCategoryInputSchema } from './BannerCreateManyCategoryInputSchema';

export const BannerCreateManyCategoryInputEnvelopeSchema: z.ZodType<Prisma.BannerCreateManyCategoryInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => BannerCreateManyCategoryInputSchema), z.lazy(() => BannerCreateManyCategoryInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export default BannerCreateManyCategoryInputEnvelopeSchema;
