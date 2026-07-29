import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { FavoriteUpdateManyMutationInputSchema } from '../inputTypeSchemas/FavoriteUpdateManyMutationInputSchema'
import { FavoriteUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/FavoriteUncheckedUpdateManyInputSchema'
import { FavoriteWhereInputSchema } from '../inputTypeSchemas/FavoriteWhereInputSchema'

export const FavoriteUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.FavoriteUpdateManyAndReturnArgs> = z.object({
  data: z.union([ FavoriteUpdateManyMutationInputSchema, FavoriteUncheckedUpdateManyInputSchema ]),
  where: FavoriteWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default FavoriteUpdateManyAndReturnArgsSchema;
