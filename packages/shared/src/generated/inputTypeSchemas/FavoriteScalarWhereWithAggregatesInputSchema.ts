import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const FavoriteScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.FavoriteScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => FavoriteScalarWhereWithAggregatesInputSchema), z.lazy(() => FavoriteScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => FavoriteScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FavoriteScalarWhereWithAggregatesInputSchema), z.lazy(() => FavoriteScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  eventId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export default FavoriteScalarWhereWithAggregatesInputSchema;
