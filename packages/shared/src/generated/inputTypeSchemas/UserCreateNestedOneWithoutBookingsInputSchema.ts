import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutBookingsInputSchema } from './UserCreateWithoutBookingsInputSchema';
import { UserUncheckedCreateWithoutBookingsInputSchema } from './UserUncheckedCreateWithoutBookingsInputSchema';
import { UserCreateOrConnectWithoutBookingsInputSchema } from './UserCreateOrConnectWithoutBookingsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutBookingsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutBookingsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutBookingsInputSchema), z.lazy(() => UserUncheckedCreateWithoutBookingsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutBookingsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
}).strict();

export default UserCreateNestedOneWithoutBookingsInputSchema;
