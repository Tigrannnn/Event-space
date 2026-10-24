import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerTranslationBannerIdLocaleCompoundUniqueInputSchema } from './BannerTranslationBannerIdLocaleCompoundUniqueInputSchema';
import { BannerTranslationWhereInputSchema } from './BannerTranslationWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumLocaleFilterSchema } from './EnumLocaleFilterSchema';
import { LocaleSchema } from './LocaleSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { BannerScalarRelationFilterSchema } from './BannerScalarRelationFilterSchema';
import { BannerWhereInputSchema } from './BannerWhereInputSchema';

export const BannerTranslationWhereUniqueInputSchema: z.ZodType<Prisma.BannerTranslationWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    bannerId_locale: z.lazy(() => BannerTranslationBannerIdLocaleCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    bannerId_locale: z.lazy(() => BannerTranslationBannerIdLocaleCompoundUniqueInputSchema),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  bannerId_locale: z.lazy(() => BannerTranslationBannerIdLocaleCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => BannerTranslationWhereInputSchema), z.lazy(() => BannerTranslationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BannerTranslationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BannerTranslationWhereInputSchema), z.lazy(() => BannerTranslationWhereInputSchema).array() ]).optional(),
  bannerId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  locale: z.union([ z.lazy(() => EnumLocaleFilterSchema), z.lazy(() => LocaleSchema) ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  subtitle: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  banner: z.union([ z.lazy(() => BannerScalarRelationFilterSchema), z.lazy(() => BannerWhereInputSchema) ]).optional(),
}));

export default BannerTranslationWhereUniqueInputSchema;
