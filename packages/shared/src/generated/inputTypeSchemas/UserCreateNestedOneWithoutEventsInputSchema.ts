import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutEventsInputSchema } from './UserCreateWithoutEventsInputSchema';
import { UserUncheckedCreateWithoutEventsInputSchema } from './UserUncheckedCreateWithoutEventsInputSchema';
import { UserCreateOrConnectWithoutEventsInputSchema } from './UserCreateOrConnectWithoutEventsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutEventsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutEventsInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutEventsInputSchema), z.lazy(() => UserUncheckedCreateWithoutEventsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutEventsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export default UserCreateNestedOneWithoutEventsInputSchema;
