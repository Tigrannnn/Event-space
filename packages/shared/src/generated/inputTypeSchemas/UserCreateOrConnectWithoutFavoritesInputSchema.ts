import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutFavoritesInputSchema } from './UserCreateWithoutFavoritesInputSchema';
import { UserUncheckedCreateWithoutFavoritesInputSchema } from './UserUncheckedCreateWithoutFavoritesInputSchema';

export const UserCreateOrConnectWithoutFavoritesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutFavoritesInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutFavoritesInputSchema), z.lazy(() => UserUncheckedCreateWithoutFavoritesInputSchema) ]),
});

export default UserCreateOrConnectWithoutFavoritesInputSchema;
