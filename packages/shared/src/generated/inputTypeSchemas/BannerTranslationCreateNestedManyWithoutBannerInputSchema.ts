import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerTranslationCreateWithoutBannerInputSchema } from './BannerTranslationCreateWithoutBannerInputSchema';
import { BannerTranslationUncheckedCreateWithoutBannerInputSchema } from './BannerTranslationUncheckedCreateWithoutBannerInputSchema';
import { BannerTranslationCreateOrConnectWithoutBannerInputSchema } from './BannerTranslationCreateOrConnectWithoutBannerInputSchema';
import { BannerTranslationCreateManyBannerInputEnvelopeSchema } from './BannerTranslationCreateManyBannerInputEnvelopeSchema';
import { BannerTranslationWhereUniqueInputSchema } from './BannerTranslationWhereUniqueInputSchema';

export const BannerTranslationCreateNestedManyWithoutBannerInputSchema: z.ZodType<Prisma.BannerTranslationCreateNestedManyWithoutBannerInput> = z.strictObject({
  create: z.union([ z.lazy(() => BannerTranslationCreateWithoutBannerInputSchema), z.lazy(() => BannerTranslationCreateWithoutBannerInputSchema).array(), z.lazy(() => BannerTranslationUncheckedCreateWithoutBannerInputSchema), z.lazy(() => BannerTranslationUncheckedCreateWithoutBannerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BannerTranslationCreateOrConnectWithoutBannerInputSchema), z.lazy(() => BannerTranslationCreateOrConnectWithoutBannerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BannerTranslationCreateManyBannerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BannerTranslationWhereUniqueInputSchema), z.lazy(() => BannerTranslationWhereUniqueInputSchema).array() ]).optional(),
});

export default BannerTranslationCreateNestedManyWithoutBannerInputSchema;
