import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const FavoriteScalarWhereInputSchema: z.ZodType<Prisma.FavoriteScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => FavoriteScalarWhereInputSchema), z.lazy(() => FavoriteScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FavoriteScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FavoriteScalarWhereInputSchema), z.lazy(() => FavoriteScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  eventId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export default FavoriteScalarWhereInputSchema;
