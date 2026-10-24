import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerTranslationWhereInputSchema } from '../inputTypeSchemas/BannerTranslationWhereInputSchema'
import { BannerTranslationOrderByWithAggregationInputSchema } from '../inputTypeSchemas/BannerTranslationOrderByWithAggregationInputSchema'
import { BannerTranslationScalarFieldEnumSchema } from '../inputTypeSchemas/BannerTranslationScalarFieldEnumSchema'
import { BannerTranslationScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/BannerTranslationScalarWhereWithAggregatesInputSchema'

export const BannerTranslationGroupByArgsSchema: z.ZodType<Prisma.BannerTranslationGroupByArgs> = z.object({
  where: BannerTranslationWhereInputSchema.optional(), 
  orderBy: z.union([ BannerTranslationOrderByWithAggregationInputSchema.array(), BannerTranslationOrderByWithAggregationInputSchema ]).optional(),
  by: BannerTranslationScalarFieldEnumSchema.array(), 
  having: BannerTranslationScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default BannerTranslationGroupByArgsSchema;
