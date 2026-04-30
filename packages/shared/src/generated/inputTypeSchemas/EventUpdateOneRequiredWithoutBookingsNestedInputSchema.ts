import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateWithoutBookingsInputSchema } from './EventCreateWithoutBookingsInputSchema';
import { EventUncheckedCreateWithoutBookingsInputSchema } from './EventUncheckedCreateWithoutBookingsInputSchema';
import { EventCreateOrConnectWithoutBookingsInputSchema } from './EventCreateOrConnectWithoutBookingsInputSchema';
import { EventUpsertWithoutBookingsInputSchema } from './EventUpsertWithoutBookingsInputSchema';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventUpdateToOneWithWhereWithoutBookingsInputSchema } from './EventUpdateToOneWithWhereWithoutBookingsInputSchema';
import { EventUpdateWithoutBookingsInputSchema } from './EventUpdateWithoutBookingsInputSchema';
import { EventUncheckedUpdateWithoutBookingsInputSchema } from './EventUncheckedUpdateWithoutBookingsInputSchema';

export const EventUpdateOneRequiredWithoutBookingsNestedInputSchema: z.ZodType<Prisma.EventUpdateOneRequiredWithoutBookingsNestedInput> = z.object({
  create: z.union([ z.lazy(() => EventCreateWithoutBookingsInputSchema), z.lazy(() => EventUncheckedCreateWithoutBookingsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EventCreateOrConnectWithoutBookingsInputSchema).optional(),
  upsert: z.lazy(() => EventUpsertWithoutBookingsInputSchema).optional(),
  connect: z.lazy(() => EventWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => EventUpdateToOneWithWhereWithoutBookingsInputSchema), z.lazy(() => EventUpdateWithoutBookingsInputSchema), z.lazy(() => EventUncheckedUpdateWithoutBookingsInputSchema) ]).optional(),
}).strict();

export default EventUpdateOneRequiredWithoutBookingsNestedInputSchema;
