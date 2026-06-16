import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserRoleSchema } from './UserRoleSchema';
import { EventUncheckedCreateNestedManyWithoutOrganizerInputSchema } from './EventUncheckedCreateNestedManyWithoutOrganizerInputSchema';
import { RefreshTokenUncheckedCreateNestedManyWithoutUserInputSchema } from './RefreshTokenUncheckedCreateNestedManyWithoutUserInputSchema';

export const UserUncheckedCreateWithoutBookingsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutBookingsInput> = z.object({
  id: z.uuid().optional(),
  email: z.string(),
  name: z.string(),
  passwordHash: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  emailVerified: z.boolean().optional(),
  isShadow: z.boolean().optional(),
  googleId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  events: z.lazy(() => EventUncheckedCreateNestedManyWithoutOrganizerInputSchema).optional(),
  refreshTokens: z.lazy(() => RefreshTokenUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
}).strict();

export default UserUncheckedCreateWithoutBookingsInputSchema;
