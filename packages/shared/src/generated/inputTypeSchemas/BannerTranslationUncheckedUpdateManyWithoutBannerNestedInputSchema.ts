import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerTranslationCreateWithoutBannerInputSchema } from './BannerTranslationCreateWithoutBannerInputSchema';
import { BannerTranslationUncheckedCreateWithoutBannerInputSchema } from './BannerTranslationUncheckedCreateWithoutBannerInputSchema';
import { BannerTranslationCreateOrConnectWithoutBannerInputSchema } from './BannerTranslationCreateOrConnectWithoutBannerInputSchema';
import { BannerTranslationUpsertWithWhereUniqueWithoutBannerInputSchema } from './BannerTranslationUpsertWithWhereUniqueWithoutBannerInputSchema';
import { BannerTranslationCreateManyBannerInputEnvelopeSchema } from './BannerTranslationCreateManyBannerInputEnvelopeSchema';
import { BannerTranslationWhereUniqueInputSchema } from './BannerTranslationWhereUniqueInputSchema';
import { BannerTranslationUpdateWithWhereUniqueWithoutBannerInputSchema } from './BannerTranslationUpdateWithWhereUniqueWithoutBannerInputSchema';
import { BannerTranslationUpdateManyWithWhereWithoutBannerInputSchema } from './BannerTranslationUpdateManyWithWhereWithoutBannerInputSchema';
import { BannerTranslationScalarWhereInputSchema } from './BannerTranslationScalarWhereInputSchema';

export const BannerTranslationUncheckedUpdateManyWithoutBannerNestedInputSchema: z.ZodType<Prisma.BannerTranslationUncheckedUpdateManyWithoutBannerNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => BannerTranslationCreateWithoutBannerInputSchema), z.lazy(() => BannerTranslationCreateWithoutBannerInputSchema).array(), z.lazy(() => BannerTranslationUncheckedCreateWithoutBannerInputSchema), z.lazy(() => BannerTranslationUncheckedCreateWithoutBannerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BannerTranslationCreateOrConnectWithoutBannerInputSchema), z.lazy(() => BannerTranslationCreateOrConnectWithoutBannerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BannerTranslationUpsertWithWhereUniqueWithoutBannerInputSchema), z.lazy(() => BannerTranslationUpsertWithWhereUniqueWithoutBannerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BannerTranslationCreateManyBannerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BannerTranslationWhereUniqueInputSchema), z.lazy(() => BannerTranslationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BannerTranslationWhereUniqueInputSchema), z.lazy(() => BannerTranslationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BannerTranslationWhereUniqueInputSchema), z.lazy(() => BannerTranslationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BannerTranslationWhereUniqueInputSchema), z.lazy(() => BannerTranslationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BannerTranslationUpdateWithWhereUniqueWithoutBannerInputSchema), z.lazy(() => BannerTranslationUpdateWithWhereUniqueWithoutBannerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BannerTranslationUpdateManyWithWhereWithoutBannerInputSchema), z.lazy(() => BannerTranslationUpdateManyWithWhereWithoutBannerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BannerTranslationScalarWhereInputSchema), z.lazy(() => BannerTranslationScalarWhereInputSchema).array() ]).optional(),
});

export default BannerTranslationUncheckedUpdateManyWithoutBannerNestedInputSchema;
