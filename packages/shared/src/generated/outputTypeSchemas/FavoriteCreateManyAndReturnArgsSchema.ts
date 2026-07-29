import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { FavoriteCreateManyInputSchema } from '../inputTypeSchemas/FavoriteCreateManyInputSchema'

export const FavoriteCreateManyAndReturnArgsSchema: z.ZodType<Prisma.FavoriteCreateManyAndReturnArgs> = z.object({
  data: z.union([ FavoriteCreateManyInputSchema, FavoriteCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default FavoriteCreateManyAndReturnArgsSchema;
