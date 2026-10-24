import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerIncludeSchema } from '../inputTypeSchemas/BannerIncludeSchema'
import { BannerUpdateInputSchema } from '../inputTypeSchemas/BannerUpdateInputSchema'
import { BannerUncheckedUpdateInputSchema } from '../inputTypeSchemas/BannerUncheckedUpdateInputSchema'
import { BannerWhereUniqueInputSchema } from '../inputTypeSchemas/BannerWhereUniqueInputSchema'
import { EventArgsSchema } from "../outputTypeSchemas/EventArgsSchema"
import { CategoryArgsSchema } from "../outputTypeSchemas/CategoryArgsSchema"
import { BannerTranslationFindManyArgsSchema } from "../outputTypeSchemas/BannerTranslationFindManyArgsSchema"
import { BannerCountOutputTypeArgsSchema } from "../outputTypeSchemas/BannerCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const BannerSelectSchema: z.ZodType<Prisma.BannerSelect> = z.object({
  id: z.boolean().optional(),
  imageUrl: z.boolean().optional(),
  imagePublicId: z.boolean().optional(),
  status: z.boolean().optional(),
  sortOrder: z.boolean().optional(),
  startsAt: z.boolean().optional(),
  endsAt: z.boolean().optional(),
  targetType: z.boolean().optional(),
  eventId: z.boolean().optional(),
  categoryId: z.boolean().optional(),
  url: z.boolean().optional(),
  textAlign: z.boolean().optional(),
  theme: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  event: z.union([z.boolean(),z.lazy(() => EventArgsSchema)]).optional(),
  category: z.union([z.boolean(),z.lazy(() => CategoryArgsSchema)]).optional(),
  translations: z.union([z.boolean(),z.lazy(() => BannerTranslationFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => BannerCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const BannerUpdateArgsSchema: z.ZodType<Prisma.BannerUpdateArgs> = z.object({
  select: BannerSelectSchema.optional(),
  include: z.lazy(() => BannerIncludeSchema).optional(),
  data: z.union([ BannerUpdateInputSchema, BannerUncheckedUpdateInputSchema ]),
  where: BannerWhereUniqueInputSchema, 
}).strict();

export default BannerUpdateArgsSchema;
