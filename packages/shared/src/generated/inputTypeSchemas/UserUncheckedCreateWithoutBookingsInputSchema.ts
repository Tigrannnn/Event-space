import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserRoleSchema } from './UserRoleSchema';
import { EventUncheckedCreateNestedManyWithoutOrganizerInputSchema } from './EventUncheckedCreateNestedManyWithoutOrganizerInputSchema';
import { RefreshTokenUncheckedCreateNestedManyWithoutUserInputSchema } from './RefreshTokenUncheckedCreateNestedManyWithoutUserInputSchema';
import { FavoriteUncheckedCreateNestedManyWithoutUserInputSchema } from './FavoriteUncheckedCreateNestedManyWithoutUserInputSchema';

export const UserUncheckedCreateWithoutBookingsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutBookingsInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.string().optional().nullable(),
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
  events: z.lazy(() => EventUncheckedCreateNestedManyWithoutOrganizerInputSchema).optional(),
  refreshTokens: z.lazy(() => RefreshTokenUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export default UserUncheckedCreateWithoutBookingsInputSchema;
