import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutEventsInputSchema } from './UserCreateWithoutEventsInputSchema';
import { UserUncheckedCreateWithoutEventsInputSchema } from './UserUncheckedCreateWithoutEventsInputSchema';
import { UserCreateOrConnectWithoutEventsInputSchema } from './UserCreateOrConnectWithoutEventsInputSchema';
import { UserUpsertWithoutEventsInputSchema } from './UserUpsertWithoutEventsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutEventsInputSchema } from './UserUpdateToOneWithWhereWithoutEventsInputSchema';
import { UserUpdateWithoutEventsInputSchema } from './UserUpdateWithoutEventsInputSchema';
import { UserUncheckedUpdateWithoutEventsInputSchema } from './UserUncheckedUpdateWithoutEventsInputSchema';

export const UserUpdateOneRequiredWithoutEventsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutEventsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutEventsInputSchema), z.lazy(() => UserUncheckedCreateWithoutEventsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutEventsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutEventsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutEventsInputSchema), z.lazy(() => UserUpdateWithoutEventsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutEventsInputSchema) ]).optional(),
});

export default UserUpdateOneRequiredWithoutEventsNestedInputSchema;
