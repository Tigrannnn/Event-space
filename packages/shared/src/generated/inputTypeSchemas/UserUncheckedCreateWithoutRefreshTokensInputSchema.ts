import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserRoleSchema } from './UserRoleSchema';
import { EventUncheckedCreateNestedManyWithoutOrganizerInputSchema } from './EventUncheckedCreateNestedManyWithoutOrganizerInputSchema';
import { BookingUncheckedCreateNestedManyWithoutUserInputSchema } from './BookingUncheckedCreateNestedManyWithoutUserInputSchema';
import { FavoriteUncheckedCreateNestedManyWithoutUserInputSchema } from './FavoriteUncheckedCreateNestedManyWithoutUserInputSchema';

export const UserUncheckedCreateWithoutRefreshTokensInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutRefreshTokensInput> = z.strictObject({
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
  bookings: z.lazy(() => BookingUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export default UserUncheckedCreateWithoutRefreshTokensInputSchema;
