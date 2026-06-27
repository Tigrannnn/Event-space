import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserRoleSchema } from './UserRoleSchema';
import { EventCreateNestedManyWithoutOrganizerInputSchema } from './EventCreateNestedManyWithoutOrganizerInputSchema';
import { RefreshTokenCreateNestedManyWithoutUserInputSchema } from './RefreshTokenCreateNestedManyWithoutUserInputSchema';

export const UserCreateWithoutBookingsInputSchema: z.ZodType<Prisma.UserCreateWithoutBookingsInput> = z.object({
  id: z.uuid().optional(),
  email: z.string(),
  name: z.string(),
  passwordHash: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  emailVerified: z.boolean().optional(),
  isShadow: z.boolean().optional(),
  phone: z.string().optional().nullable(),
  googleId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  events: z.lazy(() => EventCreateNestedManyWithoutOrganizerInputSchema).optional(),
  refreshTokens: z.lazy(() => RefreshTokenCreateNestedManyWithoutUserInputSchema).optional(),
}).strict();

export default UserCreateWithoutBookingsInputSchema;
