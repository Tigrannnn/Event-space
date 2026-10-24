import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerTranslationIncludeSchema } from '../inputTypeSchemas/BannerTranslationIncludeSchema'
import { BannerTranslationCreateInputSchema } from '../inputTypeSchemas/BannerTranslationCreateInputSchema'
import { BannerTranslationUncheckedCreateInputSchema } from '../inputTypeSchemas/BannerTranslationUncheckedCreateInputSchema'
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

export const BannerTranslationCreateArgsSchema: z.ZodType<Prisma.BannerTranslationCreateArgs> = z.object({
  select: BannerTranslationSelectSchema.optional(),
  include: z.lazy(() => BannerTranslationIncludeSchema).optional(),
  data: z.union([ BannerTranslationCreateInputSchema, BannerTranslationUncheckedCreateInputSchema ]),
}).strict();

export default BannerTranslationCreateArgsSchema;
