import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerWhereInputSchema } from '../inputTypeSchemas/BannerWhereInputSchema'
import { BannerOrderByWithAggregationInputSchema } from '../inputTypeSchemas/BannerOrderByWithAggregationInputSchema'
import { BannerScalarFieldEnumSchema } from '../inputTypeSchemas/BannerScalarFieldEnumSchema'
import { BannerScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/BannerScalarWhereWithAggregatesInputSchema'

export const BannerGroupByArgsSchema: z.ZodType<Prisma.BannerGroupByArgs> = z.object({
  where: BannerWhereInputSchema.optional(), 
  orderBy: z.union([ BannerOrderByWithAggregationInputSchema.array(), BannerOrderByWithAggregationInputSchema ]).optional(),
  by: BannerScalarFieldEnumSchema.array(), 
  having: BannerScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default BannerGroupByArgsSchema;
