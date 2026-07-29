import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutFavoritesInputSchema } from './UserCreateNestedOneWithoutFavoritesInputSchema';

export const FavoriteCreateWithoutEventInputSchema: z.ZodType<Prisma.FavoriteCreateWithoutEventInput> = z.strictObject({
  id: z.uuid().optional(),
  createdAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutFavoritesInputSchema),
});

export default FavoriteCreateWithoutEventInputSchema;
