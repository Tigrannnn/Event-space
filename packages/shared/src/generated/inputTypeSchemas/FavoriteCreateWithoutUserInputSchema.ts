import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateNestedOneWithoutFavoritesInputSchema } from './EventCreateNestedOneWithoutFavoritesInputSchema';

export const FavoriteCreateWithoutUserInputSchema: z.ZodType<Prisma.FavoriteCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  createdAt: z.coerce.date().optional(),
  event: z.lazy(() => EventCreateNestedOneWithoutFavoritesInputSchema),
});

export default FavoriteCreateWithoutUserInputSchema;
