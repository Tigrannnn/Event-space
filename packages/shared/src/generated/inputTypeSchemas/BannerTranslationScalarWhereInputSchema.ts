import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumLocaleFilterSchema } from './EnumLocaleFilterSchema';
import { LocaleSchema } from './LocaleSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';

export const BannerTranslationScalarWhereInputSchema: z.ZodType<Prisma.BannerTranslationScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => BannerTranslationScalarWhereInputSchema), z.lazy(() => BannerTranslationScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BannerTranslationScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BannerTranslationScalarWhereInputSchema), z.lazy(() => BannerTranslationScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  bannerId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  locale: z.union([ z.lazy(() => EnumLocaleFilterSchema), z.lazy(() => LocaleSchema) ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  subtitle: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  ctaLabel: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
});

export default BannerTranslationScalarWhereInputSchema;
