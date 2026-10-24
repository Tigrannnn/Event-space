import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerTranslationWhereInputSchema } from '../inputTypeSchemas/BannerTranslationWhereInputSchema'
import { BannerTranslationOrderByWithRelationInputSchema } from '../inputTypeSchemas/BannerTranslationOrderByWithRelationInputSchema'
import { BannerTranslationWhereUniqueInputSchema } from '../inputTypeSchemas/BannerTranslationWhereUniqueInputSchema'

export const BannerTranslationAggregateArgsSchema: z.ZodType<Prisma.BannerTranslationAggregateArgs> = z.object({
  where: BannerTranslationWhereInputSchema.optional(), 
  orderBy: z.union([ BannerTranslationOrderByWithRelationInputSchema.array(), BannerTranslationOrderByWithRelationInputSchema ]).optional(),
  cursor: BannerTranslationWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default BannerTranslationAggregateArgsSchema;
