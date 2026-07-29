import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereInputSchema } from './EventWhereInputSchema';
import { EventUpdateWithoutFavoritesInputSchema } from './EventUpdateWithoutFavoritesInputSchema';
import { EventUncheckedUpdateWithoutFavoritesInputSchema } from './EventUncheckedUpdateWithoutFavoritesInputSchema';

export const EventUpdateToOneWithWhereWithoutFavoritesInputSchema: z.ZodType<Prisma.EventUpdateToOneWithWhereWithoutFavoritesInput> = z.strictObject({
  where: z.lazy(() => EventWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => EventUpdateWithoutFavoritesInputSchema), z.lazy(() => EventUncheckedUpdateWithoutFavoritesInputSchema) ]),
});

export default EventUpdateToOneWithWhereWithoutFavoritesInputSchema;
