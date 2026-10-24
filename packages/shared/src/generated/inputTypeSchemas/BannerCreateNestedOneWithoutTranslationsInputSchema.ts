import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerCreateWithoutTranslationsInputSchema } from './BannerCreateWithoutTranslationsInputSchema';
import { BannerUncheckedCreateWithoutTranslationsInputSchema } from './BannerUncheckedCreateWithoutTranslationsInputSchema';
import { BannerCreateOrConnectWithoutTranslationsInputSchema } from './BannerCreateOrConnectWithoutTranslationsInputSchema';
import { BannerWhereUniqueInputSchema } from './BannerWhereUniqueInputSchema';

export const BannerCreateNestedOneWithoutTranslationsInputSchema: z.ZodType<Prisma.BannerCreateNestedOneWithoutTranslationsInput> = z.strictObject({
  create: z.union([ z.lazy(() => BannerCreateWithoutTranslationsInputSchema), z.lazy(() => BannerUncheckedCreateWithoutTranslationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => BannerCreateOrConnectWithoutTranslationsInputSchema).optional(),
  connect: z.lazy(() => BannerWhereUniqueInputSchema).optional(),
});

export default BannerCreateNestedOneWithoutTranslationsInputSchema;
