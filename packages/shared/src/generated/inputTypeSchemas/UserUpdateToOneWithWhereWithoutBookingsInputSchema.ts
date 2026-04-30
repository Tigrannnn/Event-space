import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutBookingsInputSchema } from './UserUpdateWithoutBookingsInputSchema';
import { UserUncheckedUpdateWithoutBookingsInputSchema } from './UserUncheckedUpdateWithoutBookingsInputSchema';

export const UserUpdateToOneWithWhereWithoutBookingsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutBookingsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutBookingsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutBookingsInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutBookingsInputSchema;
