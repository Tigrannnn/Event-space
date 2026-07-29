import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutFavoritesInputSchema } from './UserCreateNestedOneWithoutFavoritesInputSchema';
import { EventCreateNestedOneWithoutFavoritesInputSchema } from './EventCreateNestedOneWithoutFavoritesInputSchema';

export const FavoriteCreateInputSchema: z.ZodType<Prisma.FavoriteCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  createdAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutFavoritesInputSchema),
  event: z.lazy(() => EventCreateNestedOneWithoutFavoritesInputSchema),
});

export default FavoriteCreateInputSchema;
