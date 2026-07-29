import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { FavoriteWhereInputSchema } from './FavoriteWhereInputSchema';

export const FavoriteListRelationFilterSchema: z.ZodType<Prisma.FavoriteListRelationFilter> = z.strictObject({
  every: z.lazy(() => FavoriteWhereInputSchema).optional(),
  some: z.lazy(() => FavoriteWhereInputSchema).optional(),
  none: z.lazy(() => FavoriteWhereInputSchema).optional(),
});

export default FavoriteListRelationFilterSchema;
