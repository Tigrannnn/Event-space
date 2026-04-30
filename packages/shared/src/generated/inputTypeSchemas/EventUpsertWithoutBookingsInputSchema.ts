import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventUpdateWithoutBookingsInputSchema } from './EventUpdateWithoutBookingsInputSchema';
import { EventUncheckedUpdateWithoutBookingsInputSchema } from './EventUncheckedUpdateWithoutBookingsInputSchema';
import { EventCreateWithoutBookingsInputSchema } from './EventCreateWithoutBookingsInputSchema';
import { EventUncheckedCreateWithoutBookingsInputSchema } from './EventUncheckedCreateWithoutBookingsInputSchema';
import { EventWhereInputSchema } from './EventWhereInputSchema';

export const EventUpsertWithoutBookingsInputSchema: z.ZodType<Prisma.EventUpsertWithoutBookingsInput> = z.object({
  update: z.union([ z.lazy(() => EventUpdateWithoutBookingsInputSchema), z.lazy(() => EventUncheckedUpdateWithoutBookingsInputSchema) ]),
  create: z.union([ z.lazy(() => EventCreateWithoutBookingsInputSchema), z.lazy(() => EventUncheckedCreateWithoutBookingsInputSchema) ]),
  where: z.lazy(() => EventWhereInputSchema).optional(),
}).strict();

export default EventUpsertWithoutBookingsInputSchema;
