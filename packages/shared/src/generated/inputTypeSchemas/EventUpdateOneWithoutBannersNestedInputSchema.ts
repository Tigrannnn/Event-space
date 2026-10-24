import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateWithoutBannersInputSchema } from './EventCreateWithoutBannersInputSchema';
import { EventUncheckedCreateWithoutBannersInputSchema } from './EventUncheckedCreateWithoutBannersInputSchema';
import { EventCreateOrConnectWithoutBannersInputSchema } from './EventCreateOrConnectWithoutBannersInputSchema';
import { EventUpsertWithoutBannersInputSchema } from './EventUpsertWithoutBannersInputSchema';
import { EventWhereInputSchema } from './EventWhereInputSchema';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventUpdateToOneWithWhereWithoutBannersInputSchema } from './EventUpdateToOneWithWhereWithoutBannersInputSchema';
import { EventUpdateWithoutBannersInputSchema } from './EventUpdateWithoutBannersInputSchema';
import { EventUncheckedUpdateWithoutBannersInputSchema } from './EventUncheckedUpdateWithoutBannersInputSchema';

export const EventUpdateOneWithoutBannersNestedInputSchema: z.ZodType<Prisma.EventUpdateOneWithoutBannersNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => EventCreateWithoutBannersInputSchema), z.lazy(() => EventUncheckedCreateWithoutBannersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EventCreateOrConnectWithoutBannersInputSchema).optional(),
  upsert: z.lazy(() => EventUpsertWithoutBannersInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => EventWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => EventWhereInputSchema) ]).optional(),
  connect: z.lazy(() => EventWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => EventUpdateToOneWithWhereWithoutBannersInputSchema), z.lazy(() => EventUpdateWithoutBannersInputSchema), z.lazy(() => EventUncheckedUpdateWithoutBannersInputSchema) ]).optional(),
});

export default EventUpdateOneWithoutBannersNestedInputSchema;
