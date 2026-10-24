import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerTranslationIncludeSchema } from '../inputTypeSchemas/BannerTranslationIncludeSchema'
import { BannerTranslationWhereUniqueInputSchema } from '../inputTypeSchemas/BannerTranslationWhereUniqueInputSchema'
import { BannerTranslationCreateInputSchema } from '../inputTypeSchemas/BannerTranslationCreateInputSchema'
import { BannerTranslationUncheckedCreateInputSchema } from '../inputTypeSchemas/BannerTranslationUncheckedCreateInputSchema'
import { BannerTranslationUpdateInputSchema } from '../inputTypeSchemas/BannerTranslationUpdateInputSchema'
import { BannerTranslationUncheckedUpdateInputSchema } from '../inputTypeSchemas/BannerTranslationUncheckedUpdateInputSchema'
import { BannerArgsSchema } from "../outputTypeSchemas/BannerArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const BannerTranslationSelectSchema: z.ZodType<Prisma.BannerTranslationSelect> = z.object({
  id: z.boolean().optional(),
  bannerId: z.boolean().optional(),
  locale: z.boolean().optional(),
  title: z.boolean().optional(),
  subtitle: z.boolean().optional(),
  banner: z.union([z.boolean(),z.lazy(() => BannerArgsSchema)]).optional(),
}).strict()

export const BannerTranslationUpsertArgsSchema: z.ZodType<Prisma.BannerTranslationUpsertArgs> = z.object({
  select: BannerTranslationSelectSchema.optional(),
  include: z.lazy(() => BannerTranslationIncludeSchema).optional(),
  where: BannerTranslationWhereUniqueInputSchema, 
  create: z.union([ BannerTranslationCreateInputSchema, BannerTranslationUncheckedCreateInputSchema ]),
  update: z.union([ BannerTranslationUpdateInputSchema, BannerTranslationUncheckedUpdateInputSchema ]),
}).strict();

export default BannerTranslationUpsertArgsSchema;
