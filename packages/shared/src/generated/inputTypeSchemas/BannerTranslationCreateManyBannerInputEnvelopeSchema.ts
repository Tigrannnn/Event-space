import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerTranslationCreateManyBannerInputSchema } from './BannerTranslationCreateManyBannerInputSchema';

export const BannerTranslationCreateManyBannerInputEnvelopeSchema: z.ZodType<Prisma.BannerTranslationCreateManyBannerInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => BannerTranslationCreateManyBannerInputSchema), z.lazy(() => BannerTranslationCreateManyBannerInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export default BannerTranslationCreateManyBannerInputEnvelopeSchema;
