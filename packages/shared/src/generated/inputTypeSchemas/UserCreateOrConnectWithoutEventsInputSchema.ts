import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutEventsInputSchema } from './UserCreateWithoutEventsInputSchema';
import { UserUncheckedCreateWithoutEventsInputSchema } from './UserUncheckedCreateWithoutEventsInputSchema';

export const UserCreateOrConnectWithoutEventsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutEventsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutEventsInputSchema), z.lazy(() => UserUncheckedCreateWithoutEventsInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutEventsInputSchema;
