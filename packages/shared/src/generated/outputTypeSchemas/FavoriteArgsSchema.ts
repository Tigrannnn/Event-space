import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { FavoriteSelectSchema } from '../inputTypeSchemas/FavoriteSelectSchema';
import { FavoriteIncludeSchema } from '../inputTypeSchemas/FavoriteIncludeSchema';

export const FavoriteArgsSchema: z.ZodType<Prisma.FavoriteDefaultArgs> = z.object({
  select: z.lazy(() => FavoriteSelectSchema).optional(),
  include: z.lazy(() => FavoriteIncludeSchema).optional(),
}).strict();

export default FavoriteArgsSchema;
