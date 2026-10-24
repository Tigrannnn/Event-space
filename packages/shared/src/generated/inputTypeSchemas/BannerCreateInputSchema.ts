import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerStatusSchema } from './BannerStatusSchema';
import { BannerTargetTypeSchema } from './BannerTargetTypeSchema';
import { BannerTextAlignSchema } from './BannerTextAlignSchema';
import { BannerThemeSchema } from './BannerThemeSchema';
import { EventCreateNestedOneWithoutBannersInputSchema } from './EventCreateNestedOneWithoutBannersInputSchema';
import { CategoryCreateNestedOneWithoutBannersInputSchema } from './CategoryCreateNestedOneWithoutBannersInputSchema';
import { BannerTranslationCreateNestedManyWithoutBannerInputSchema } from './BannerTranslationCreateNestedManyWithoutBannerInputSchema';

export const BannerCreateInputSchema: z.ZodType<Prisma.BannerCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  imageUrl: z.string(),
  imagePublicId: z.string(),
  status: z.lazy(() => BannerStatusSchema).optional(),
  sortOrder: z.number().int().optional(),
  startsAt: z.coerce.date().optional().nullable(),
  endsAt: z.coerce.date().optional().nullable(),
  targetType: z.lazy(() => BannerTargetTypeSchema),
  url: z.string().optional().nullable(),
  textAlign: z.lazy(() => BannerTextAlignSchema).optional(),
  theme: z.lazy(() => BannerThemeSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  event: z.lazy(() => EventCreateNestedOneWithoutBannersInputSchema).optional(),
  category: z.lazy(() => CategoryCreateNestedOneWithoutBannersInputSchema).optional(),
  translations: z.lazy(() => BannerTranslationCreateNestedManyWithoutBannerInputSchema).optional(),
});

export default BannerCreateInputSchema;
