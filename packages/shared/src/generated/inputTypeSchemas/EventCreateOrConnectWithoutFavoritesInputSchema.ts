import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventCreateWithoutFavoritesInputSchema } from './EventCreateWithoutFavoritesInputSchema';
import { EventUncheckedCreateWithoutFavoritesInputSchema } from './EventUncheckedCreateWithoutFavoritesInputSchema';

export const EventCreateOrConnectWithoutFavoritesInputSchema: z.ZodType<Prisma.EventCreateOrConnectWithoutFavoritesInput> = z.strictObject({
  where: z.lazy(() => EventWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EventCreateWithoutFavoritesInputSchema), z.lazy(() => EventUncheckedCreateWithoutFavoritesInputSchema) ]),
});

export default EventCreateOrConnectWithoutFavoritesInputSchema;
