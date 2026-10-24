import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerWhereInputSchema } from '../inputTypeSchemas/BannerWhereInputSchema'
import { BannerOrderByWithRelationInputSchema } from '../inputTypeSchemas/BannerOrderByWithRelationInputSchema'
import { BannerWhereUniqueInputSchema } from '../inputTypeSchemas/BannerWhereUniqueInputSchema'

export const BannerAggregateArgsSchema: z.ZodType<Prisma.BannerAggregateArgs> = z.object({
  where: BannerWhereInputSchema.optional(), 
  orderBy: z.union([ BannerOrderByWithRelationInputSchema.array(), BannerOrderByWithRelationInputSchema ]).optional(),
  cursor: BannerWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default BannerAggregateArgsSchema;
