import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { EnumUserRoleFilterSchema } from './EnumUserRoleFilterSchema';
import { UserRoleSchema } from './UserRoleSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { EventListRelationFilterSchema } from './EventListRelationFilterSchema';
import { RefreshTokenListRelationFilterSchema } from './RefreshTokenListRelationFilterSchema';
import { BookingListRelationFilterSchema } from './BookingListRelationFilterSchema';
import { FavoriteListRelationFilterSchema } from './FavoriteListRelationFilterSchema';

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    email: z.string(),
    googleId: z.string(),
  }),
  z.object({
    id: z.uuid(),
    email: z.string(),
  }),
  z.object({
    id: z.uuid(),
    googleId: z.string(),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    email: z.string(),
    googleId: z.string(),
  }),
  z.object({
    email: z.string(),
  }),
  z.object({
    googleId: z.string(),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  email: z.string().optional(),
  googleId: z.string().optional(),
  AND: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  passwordHash: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  image: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  role: z.union([ z.lazy(() => EnumUserRoleFilterSchema), z.lazy(() => UserRoleSchema) ]).optional(),
  emailVerified: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  isShadow: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  phone: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  events: z.lazy(() => EventListRelationFilterSchema).optional(),
  refreshTokens: z.lazy(() => RefreshTokenListRelationFilterSchema).optional(),
  bookings: z.lazy(() => BookingListRelationFilterSchema).optional(),
  favorites: z.lazy(() => FavoriteListRelationFilterSchema).optional(),
}));

export default UserWhereUniqueInputSchema;
