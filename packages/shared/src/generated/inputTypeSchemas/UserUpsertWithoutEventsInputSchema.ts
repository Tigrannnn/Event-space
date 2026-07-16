import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserUpdateWithoutEventsInputSchema } from './UserUpdateWithoutEventsInputSchema';
import { UserUncheckedUpdateWithoutEventsInputSchema } from './UserUncheckedUpdateWithoutEventsInputSchema';
import { UserCreateWithoutEventsInputSchema } from './UserCreateWithoutEventsInputSchema';
import { UserUncheckedCreateWithoutEventsInputSchema } from './UserUncheckedCreateWithoutEventsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutEventsInputSchema: z.ZodType<Prisma.UserUpsertWithoutEventsInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutEventsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutEventsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutEventsInputSchema), z.lazy(() => UserUncheckedCreateWithoutEventsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export default UserUpsertWithoutEventsInputSchema;
