import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserRoleSchema } from './UserRoleSchema';
import { RefreshTokenUncheckedCreateNestedManyWithoutUserInputSchema } from './RefreshTokenUncheckedCreateNestedManyWithoutUserInputSchema';
import { BookingUncheckedCreateNestedManyWithoutUserInputSchema } from './BookingUncheckedCreateNestedManyWithoutUserInputSchema';

export const UserUncheckedCreateWithoutEventsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutEventsInput> = z.object({
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
  refreshTokens: z.lazy(() => RefreshTokenUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bookings: z.lazy(() => BookingUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
}).strict();

export default UserUncheckedCreateWithoutEventsInputSchema;
