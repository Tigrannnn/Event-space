import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerStatusSchema } from './BannerStatusSchema';
import { BannerTargetTypeSchema } from './BannerTargetTypeSchema';
import { BannerTextAlignSchema } from './BannerTextAlignSchema';
import { BannerThemeSchema } from './BannerThemeSchema';

export const BannerCreateManyEventInputSchema: z.ZodType<Prisma.BannerCreateManyEventInput> = z.strictObject({
  id: z.uuid().optional(),
  imageUrl: z.string(),
  imagePublicId: z.string(),
  imageMobileUrl: z.string().optional().nullable(),
  imageMobilePublicId: z.string().optional().nullable(),
  status: z.lazy(() => BannerStatusSchema).optional(),
  sortOrder: z.number().int().optional(),
  startsAt: z.coerce.date().optional().nullable(),
  endsAt: z.coerce.date().optional().nullable(),
  targetType: z.lazy(() => BannerTargetTypeSchema),
  categoryId: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  textAlign: z.lazy(() => BannerTextAlignSchema).optional(),
  theme: z.lazy(() => BannerThemeSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export default BannerCreateManyEventInputSchema;
