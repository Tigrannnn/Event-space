import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerTranslationIncludeSchema } from '../inputTypeSchemas/BannerTranslationIncludeSchema'
import { BannerTranslationWhereInputSchema } from '../inputTypeSchemas/BannerTranslationWhereInputSchema'
import { BannerTranslationOrderByWithRelationInputSchema } from '../inputTypeSchemas/BannerTranslationOrderByWithRelationInputSchema'
import { BannerTranslationWhereUniqueInputSchema } from '../inputTypeSchemas/BannerTranslationWhereUniqueInputSchema'
import { BannerTranslationScalarFieldEnumSchema } from '../inputTypeSchemas/BannerTranslationScalarFieldEnumSchema'
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

export const BannerTranslationFindFirstArgsSchema: z.ZodType<Prisma.BannerTranslationFindFirstArgs> = z.object({
  select: BannerTranslationSelectSchema.optional(),
  include: z.lazy(() => BannerTranslationIncludeSchema).optional(),
  where: BannerTranslationWhereInputSchema.optional(), 
  orderBy: z.union([ BannerTranslationOrderByWithRelationInputSchema.array(), BannerTranslationOrderByWithRelationInputSchema ]).optional(),
  cursor: BannerTranslationWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BannerTranslationScalarFieldEnumSchema, BannerTranslationScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export default BannerTranslationFindFirstArgsSchema;
