import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { FavoriteWhereInputSchema } from '../inputTypeSchemas/FavoriteWhereInputSchema'

export const FavoriteDeleteManyArgsSchema: z.ZodType<Prisma.FavoriteDeleteManyArgs> = z.object({
  where: FavoriteWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default FavoriteDeleteManyArgsSchema;
