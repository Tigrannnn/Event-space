import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutBookingsInputSchema } from './UserCreateWithoutBookingsInputSchema';
import { UserUncheckedCreateWithoutBookingsInputSchema } from './UserUncheckedCreateWithoutBookingsInputSchema';

export const UserCreateOrConnectWithoutBookingsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutBookingsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutBookingsInputSchema), z.lazy(() => UserUncheckedCreateWithoutBookingsInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutBookingsInputSchema;
