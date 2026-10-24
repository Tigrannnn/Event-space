import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerCreateWithoutTranslationsInputSchema } from './BannerCreateWithoutTranslationsInputSchema';
import { BannerUncheckedCreateWithoutTranslationsInputSchema } from './BannerUncheckedCreateWithoutTranslationsInputSchema';
import { BannerCreateOrConnectWithoutTranslationsInputSchema } from './BannerCreateOrConnectWithoutTranslationsInputSchema';
import { BannerUpsertWithoutTranslationsInputSchema } from './BannerUpsertWithoutTranslationsInputSchema';
import { BannerWhereUniqueInputSchema } from './BannerWhereUniqueInputSchema';
import { BannerUpdateToOneWithWhereWithoutTranslationsInputSchema } from './BannerUpdateToOneWithWhereWithoutTranslationsInputSchema';
import { BannerUpdateWithoutTranslationsInputSchema } from './BannerUpdateWithoutTranslationsInputSchema';
import { BannerUncheckedUpdateWithoutTranslationsInputSchema } from './BannerUncheckedUpdateWithoutTranslationsInputSchema';

export const BannerUpdateOneRequiredWithoutTranslationsNestedInputSchema: z.ZodType<Prisma.BannerUpdateOneRequiredWithoutTranslationsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => BannerCreateWithoutTranslationsInputSchema), z.lazy(() => BannerUncheckedCreateWithoutTranslationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => BannerCreateOrConnectWithoutTranslationsInputSchema).optional(),
  upsert: z.lazy(() => BannerUpsertWithoutTranslationsInputSchema).optional(),
  connect: z.lazy(() => BannerWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => BannerUpdateToOneWithWhereWithoutTranslationsInputSchema), z.lazy(() => BannerUpdateWithoutTranslationsInputSchema), z.lazy(() => BannerUncheckedUpdateWithoutTranslationsInputSchema) ]).optional(),
});

export default BannerUpdateOneRequiredWithoutTranslationsNestedInputSchema;
