import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutBookingsInputSchema } from './UserCreateWithoutBookingsInputSchema';
import { UserUncheckedCreateWithoutBookingsInputSchema } from './UserUncheckedCreateWithoutBookingsInputSchema';
import { UserCreateOrConnectWithoutBookingsInputSchema } from './UserCreateOrConnectWithoutBookingsInputSchema';
import { UserUpsertWithoutBookingsInputSchema } from './UserUpsertWithoutBookingsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutBookingsInputSchema } from './UserUpdateToOneWithWhereWithoutBookingsInputSchema';
import { UserUpdateWithoutBookingsInputSchema } from './UserUpdateWithoutBookingsInputSchema';
import { UserUncheckedUpdateWithoutBookingsInputSchema } from './UserUncheckedUpdateWithoutBookingsInputSchema';

export const UserUpdateOneRequiredWithoutBookingsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutBookingsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutBookingsInputSchema), z.lazy(() => UserUncheckedCreateWithoutBookingsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutBookingsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutBookingsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutBookingsInputSchema), z.lazy(() => UserUpdateWithoutBookingsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutBookingsInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneRequiredWithoutBookingsNestedInputSchema;
