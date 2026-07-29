import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutFavoritesInputSchema } from './UserCreateWithoutFavoritesInputSchema';
import { UserUncheckedCreateWithoutFavoritesInputSchema } from './UserUncheckedCreateWithoutFavoritesInputSchema';
import { UserCreateOrConnectWithoutFavoritesInputSchema } from './UserCreateOrConnectWithoutFavoritesInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutFavoritesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutFavoritesInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutFavoritesInputSchema), z.lazy(() => UserUncheckedCreateWithoutFavoritesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutFavoritesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export default UserCreateNestedOneWithoutFavoritesInputSchema;
