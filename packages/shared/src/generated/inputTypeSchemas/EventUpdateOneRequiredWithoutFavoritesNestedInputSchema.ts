import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateWithoutFavoritesInputSchema } from './EventCreateWithoutFavoritesInputSchema';
import { EventUncheckedCreateWithoutFavoritesInputSchema } from './EventUncheckedCreateWithoutFavoritesInputSchema';
import { EventCreateOrConnectWithoutFavoritesInputSchema } from './EventCreateOrConnectWithoutFavoritesInputSchema';
import { EventUpsertWithoutFavoritesInputSchema } from './EventUpsertWithoutFavoritesInputSchema';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventUpdateToOneWithWhereWithoutFavoritesInputSchema } from './EventUpdateToOneWithWhereWithoutFavoritesInputSchema';
import { EventUpdateWithoutFavoritesInputSchema } from './EventUpdateWithoutFavoritesInputSchema';
import { EventUncheckedUpdateWithoutFavoritesInputSchema } from './EventUncheckedUpdateWithoutFavoritesInputSchema';

export const EventUpdateOneRequiredWithoutFavoritesNestedInputSchema: z.ZodType<Prisma.EventUpdateOneRequiredWithoutFavoritesNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => EventCreateWithoutFavoritesInputSchema), z.lazy(() => EventUncheckedCreateWithoutFavoritesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EventCreateOrConnectWithoutFavoritesInputSchema).optional(),
  upsert: z.lazy(() => EventUpsertWithoutFavoritesInputSchema).optional(),
  connect: z.lazy(() => EventWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => EventUpdateToOneWithWhereWithoutFavoritesInputSchema), z.lazy(() => EventUpdateWithoutFavoritesInputSchema), z.lazy(() => EventUncheckedUpdateWithoutFavoritesInputSchema) ]).optional(),
});

export default EventUpdateOneRequiredWithoutFavoritesNestedInputSchema;
