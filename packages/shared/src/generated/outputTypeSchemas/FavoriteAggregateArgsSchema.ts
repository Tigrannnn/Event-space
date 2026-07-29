import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { FavoriteWhereInputSchema } from '../inputTypeSchemas/FavoriteWhereInputSchema'
import { FavoriteOrderByWithRelationInputSchema } from '../inputTypeSchemas/FavoriteOrderByWithRelationInputSchema'
import { FavoriteWhereUniqueInputSchema } from '../inputTypeSchemas/FavoriteWhereUniqueInputSchema'

export const FavoriteAggregateArgsSchema: z.ZodType<Prisma.FavoriteAggregateArgs> = z.object({
  where: FavoriteWhereInputSchema.optional(), 
  orderBy: z.union([ FavoriteOrderByWithRelationInputSchema.array(), FavoriteOrderByWithRelationInputSchema ]).optional(),
  cursor: FavoriteWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default FavoriteAggregateArgsSchema;
