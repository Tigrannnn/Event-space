import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { FavoriteUserIdEventIdCompoundUniqueInputSchema } from './FavoriteUserIdEventIdCompoundUniqueInputSchema';
import { FavoriteWhereInputSchema } from './FavoriteWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { EventScalarRelationFilterSchema } from './EventScalarRelationFilterSchema';
import { EventWhereInputSchema } from './EventWhereInputSchema';

export const FavoriteWhereUniqueInputSchema: z.ZodType<Prisma.FavoriteWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    userId_eventId: z.lazy(() => FavoriteUserIdEventIdCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    userId_eventId: z.lazy(() => FavoriteUserIdEventIdCompoundUniqueInputSchema),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  userId_eventId: z.lazy(() => FavoriteUserIdEventIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => FavoriteWhereInputSchema), z.lazy(() => FavoriteWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FavoriteWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FavoriteWhereInputSchema), z.lazy(() => FavoriteWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  eventId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  event: z.union([ z.lazy(() => EventScalarRelationFilterSchema), z.lazy(() => EventWhereInputSchema) ]).optional(),
}));

export default FavoriteWhereUniqueInputSchema;
