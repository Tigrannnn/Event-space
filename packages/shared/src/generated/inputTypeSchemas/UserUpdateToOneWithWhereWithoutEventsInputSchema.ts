import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutEventsInputSchema } from './UserUpdateWithoutEventsInputSchema';
import { UserUncheckedUpdateWithoutEventsInputSchema } from './UserUncheckedUpdateWithoutEventsInputSchema';

export const UserUpdateToOneWithWhereWithoutEventsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutEventsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutEventsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutEventsInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutEventsInputSchema;
