import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutFavoritesInputSchema } from './UserCreateWithoutFavoritesInputSchema';
import { UserUncheckedCreateWithoutFavoritesInputSchema } from './UserUncheckedCreateWithoutFavoritesInputSchema';
import { UserCreateOrConnectWithoutFavoritesInputSchema } from './UserCreateOrConnectWithoutFavoritesInputSchema';
import { UserUpsertWithoutFavoritesInputSchema } from './UserUpsertWithoutFavoritesInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutFavoritesInputSchema } from './UserUpdateToOneWithWhereWithoutFavoritesInputSchema';
import { UserUpdateWithoutFavoritesInputSchema } from './UserUpdateWithoutFavoritesInputSchema';
import { UserUncheckedUpdateWithoutFavoritesInputSchema } from './UserUncheckedUpdateWithoutFavoritesInputSchema';

export const UserUpdateOneRequiredWithoutFavoritesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutFavoritesNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutFavoritesInputSchema), z.lazy(() => UserUncheckedCreateWithoutFavoritesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutFavoritesInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutFavoritesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutFavoritesInputSchema), z.lazy(() => UserUpdateWithoutFavoritesInputSchema), z.lazy(() => UserUncheckedUpdateWithoutFavoritesInputSchema) ]).optional(),
});

export default UserUpdateOneRequiredWithoutFavoritesNestedInputSchema;
