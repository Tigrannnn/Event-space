import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { FavoriteCreateManyInputSchema } from '../inputTypeSchemas/FavoriteCreateManyInputSchema'

export const FavoriteCreateManyArgsSchema: z.ZodType<Prisma.FavoriteCreateManyArgs> = z.object({
  data: z.union([ FavoriteCreateManyInputSchema, FavoriteCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default FavoriteCreateManyArgsSchema;
