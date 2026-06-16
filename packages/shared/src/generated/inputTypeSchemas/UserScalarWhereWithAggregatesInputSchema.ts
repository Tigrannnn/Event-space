import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { EnumUserRoleWithAggregatesFilterSchema } from './EnumUserRoleWithAggregatesFilterSchema';
import { UserRoleSchema } from './UserRoleSchema';
import { BoolWithAggregatesFilterSchema } from './BoolWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema), z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema), z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  passwordHash: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  image: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  role: z.union([ z.lazy(() => EnumUserRoleWithAggregatesFilterSchema), z.lazy(() => UserRoleSchema) ]).optional(),
  emailVerified: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean() ]).optional(),
  isShadow: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean() ]).optional(),
  googleId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
}).strict();

export default UserScalarWhereWithAggregatesInputSchema;
