import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventCreateWithoutBookingsInputSchema } from './EventCreateWithoutBookingsInputSchema';
import { EventUncheckedCreateWithoutBookingsInputSchema } from './EventUncheckedCreateWithoutBookingsInputSchema';

export const EventCreateOrConnectWithoutBookingsInputSchema: z.ZodType<Prisma.EventCreateOrConnectWithoutBookingsInput> = z.object({
  where: z.lazy(() => EventWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EventCreateWithoutBookingsInputSchema), z.lazy(() => EventUncheckedCreateWithoutBookingsInputSchema) ]),
}).strict();

export default EventCreateOrConnectWithoutBookingsInputSchema;
