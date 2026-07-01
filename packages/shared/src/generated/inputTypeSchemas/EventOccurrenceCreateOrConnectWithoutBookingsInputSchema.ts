import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceWhereUniqueInputSchema } from './EventOccurrenceWhereUniqueInputSchema';
import { EventOccurrenceCreateWithoutBookingsInputSchema } from './EventOccurrenceCreateWithoutBookingsInputSchema';
import { EventOccurrenceUncheckedCreateWithoutBookingsInputSchema } from './EventOccurrenceUncheckedCreateWithoutBookingsInputSchema';

export const EventOccurrenceCreateOrConnectWithoutBookingsInputSchema: z.ZodType<Prisma.EventOccurrenceCreateOrConnectWithoutBookingsInput> = z.object({
  where: z.lazy(() => EventOccurrenceWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EventOccurrenceCreateWithoutBookingsInputSchema), z.lazy(() => EventOccurrenceUncheckedCreateWithoutBookingsInputSchema) ]),
}).strict();

export default EventOccurrenceCreateOrConnectWithoutBookingsInputSchema;
