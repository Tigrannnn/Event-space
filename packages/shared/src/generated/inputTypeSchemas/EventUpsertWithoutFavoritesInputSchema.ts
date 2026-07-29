import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventUpdateWithoutFavoritesInputSchema } from './EventUpdateWithoutFavoritesInputSchema';
import { EventUncheckedUpdateWithoutFavoritesInputSchema } from './EventUncheckedUpdateWithoutFavoritesInputSchema';
import { EventCreateWithoutFavoritesInputSchema } from './EventCreateWithoutFavoritesInputSchema';
import { EventUncheckedCreateWithoutFavoritesInputSchema } from './EventUncheckedCreateWithoutFavoritesInputSchema';
import { EventWhereInputSchema } from './EventWhereInputSchema';

export const EventUpsertWithoutFavoritesInputSchema: z.ZodType<Prisma.EventUpsertWithoutFavoritesInput> = z.strictObject({
  update: z.union([ z.lazy(() => EventUpdateWithoutFavoritesInputSchema), z.lazy(() => EventUncheckedUpdateWithoutFavoritesInputSchema) ]),
  create: z.union([ z.lazy(() => EventCreateWithoutFavoritesInputSchema), z.lazy(() => EventUncheckedCreateWithoutFavoritesInputSchema) ]),
  where: z.lazy(() => EventWhereInputSchema).optional(),
});

export default EventUpsertWithoutFavoritesInputSchema;
