import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerTranslationIncludeSchema } from '../inputTypeSchemas/BannerTranslationIncludeSchema'
import { BannerTranslationUpdateInputSchema } from '../inputTypeSchemas/BannerTranslationUpdateInputSchema'
import { BannerTranslationUncheckedUpdateInputSchema } from '../inputTypeSchemas/BannerTranslationUncheckedUpdateInputSchema'
import { BannerTranslationWhereUniqueInputSchema } from '../inputTypeSchemas/BannerTranslationWhereUniqueInputSchema'
import { BannerArgsSchema } from "../outputTypeSchemas/BannerArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const BannerTranslationSelectSchema: z.ZodType<Prisma.BannerTranslationSelect> = z.object({
  id: z.boolean().optional(),
  bannerId: z.boolean().optional(),
  locale: z.boolean().optional(),
  title: z.boolean().optional(),
  subtitle: z.boolean().optional(),
  ctaLabel: z.boolean().optional(),
  banner: z.union([z.boolean(),z.lazy(() => BannerArgsSchema)]).optional(),
}).strict()

export const BannerTranslationUpdateArgsSchema: z.ZodType<Prisma.BannerTranslationUpdateArgs> = z.object({
  select: BannerTranslationSelectSchema.optional(),
  include: z.lazy(() => BannerTranslationIncludeSchema).optional(),
  data: z.union([ BannerTranslationUpdateInputSchema, BannerTranslationUncheckedUpdateInputSchema ]),
  where: BannerTranslationWhereUniqueInputSchema, 
}).strict();

export default BannerTranslationUpdateArgsSchema;
