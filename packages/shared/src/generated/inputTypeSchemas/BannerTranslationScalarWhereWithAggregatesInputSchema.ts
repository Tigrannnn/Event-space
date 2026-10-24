import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { EnumLocaleWithAggregatesFilterSchema } from './EnumLocaleWithAggregatesFilterSchema';
import { LocaleSchema } from './LocaleSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';

export const BannerTranslationScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.BannerTranslationScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => BannerTranslationScalarWhereWithAggregatesInputSchema), z.lazy(() => BannerTranslationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => BannerTranslationScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BannerTranslationScalarWhereWithAggregatesInputSchema), z.lazy(() => BannerTranslationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  bannerId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  locale: z.union([ z.lazy(() => EnumLocaleWithAggregatesFilterSchema), z.lazy(() => LocaleSchema) ]).optional(),
  title: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  subtitle: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  ctaLabel: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
});

export default BannerTranslationScalarWhereWithAggregatesInputSchema;
