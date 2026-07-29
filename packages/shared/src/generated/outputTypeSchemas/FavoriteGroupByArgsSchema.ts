import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { FavoriteWhereInputSchema } from '../inputTypeSchemas/FavoriteWhereInputSchema'
import { FavoriteOrderByWithAggregationInputSchema } from '../inputTypeSchemas/FavoriteOrderByWithAggregationInputSchema'
import { FavoriteScalarFieldEnumSchema } from '../inputTypeSchemas/FavoriteScalarFieldEnumSchema'
import { FavoriteScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/FavoriteScalarWhereWithAggregatesInputSchema'

export const FavoriteGroupByArgsSchema: z.ZodType<Prisma.FavoriteGroupByArgs> = z.object({
  where: FavoriteWhereInputSchema.optional(), 
  orderBy: z.union([ FavoriteOrderByWithAggregationInputSchema.array(), FavoriteOrderByWithAggregationInputSchema ]).optional(),
  by: FavoriteScalarFieldEnumSchema.array(), 
  having: FavoriteScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default FavoriteGroupByArgsSchema;
