import { z } from 'zod';
import { BannerStatusSchema } from '../inputTypeSchemas/BannerStatusSchema'
import { BannerTargetTypeSchema } from '../inputTypeSchemas/BannerTargetTypeSchema'
import { BannerTextAlignSchema } from '../inputTypeSchemas/BannerTextAlignSchema'
import { BannerThemeSchema } from '../inputTypeSchemas/BannerThemeSchema'

/////////////////////////////////////////
// BANNER SCHEMA
/////////////////////////////////////////

export const BannerSchema = z.object({
  status: BannerStatusSchema,
  targetType: BannerTargetTypeSchema,
  textAlign: BannerTextAlignSchema,
  theme: BannerThemeSchema,
  id: z.uuid(),
  imageUrl: z.string(),
  imagePublicId: z.string(),
  sortOrder: z.number().int(),
  startsAt: z.coerce.date().nullable(),
  endsAt: z.coerce.date().nullable(),
  eventId: z.string().nullable(),
  categoryId: z.string().nullable(),
  url: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Banner = z.infer<typeof BannerSchema>

export default BannerSchema;
