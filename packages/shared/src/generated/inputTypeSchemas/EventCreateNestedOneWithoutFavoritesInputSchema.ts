import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateWithoutFavoritesInputSchema } from './EventCreateWithoutFavoritesInputSchema';
import { EventUncheckedCreateWithoutFavoritesInputSchema } from './EventUncheckedCreateWithoutFavoritesInputSchema';
import { EventCreateOrConnectWithoutFavoritesInputSchema } from './EventCreateOrConnectWithoutFavoritesInputSchema';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';

export const EventCreateNestedOneWithoutFavoritesInputSchema: z.ZodType<Prisma.EventCreateNestedOneWithoutFavoritesInput> = z.strictObject({
  create: z.union([ z.lazy(() => EventCreateWithoutFavoritesInputSchema), z.lazy(() => EventUncheckedCreateWithoutFavoritesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EventCreateOrConnectWithoutFavoritesInputSchema).optional(),
  connect: z.lazy(() => EventWhereUniqueInputSchema).optional(),
});

export default EventCreateNestedOneWithoutFavoritesInputSchema;
