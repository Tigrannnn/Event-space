import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserUpdateWithoutBookingsInputSchema } from './UserUpdateWithoutBookingsInputSchema';
import { UserUncheckedUpdateWithoutBookingsInputSchema } from './UserUncheckedUpdateWithoutBookingsInputSchema';
import { UserCreateWithoutBookingsInputSchema } from './UserCreateWithoutBookingsInputSchema';
import { UserUncheckedCreateWithoutBookingsInputSchema } from './UserUncheckedCreateWithoutBookingsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutBookingsInputSchema: z.ZodType<Prisma.UserUpsertWithoutBookingsInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutBookingsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutBookingsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutBookingsInputSchema), z.lazy(() => UserUncheckedCreateWithoutBookingsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export default UserUpsertWithoutBookingsInputSchema;
