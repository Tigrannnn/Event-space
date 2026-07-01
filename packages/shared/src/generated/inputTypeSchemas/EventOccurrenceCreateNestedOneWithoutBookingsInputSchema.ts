import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceCreateWithoutBookingsInputSchema } from './EventOccurrenceCreateWithoutBookingsInputSchema';
import { EventOccurrenceUncheckedCreateWithoutBookingsInputSchema } from './EventOccurrenceUncheckedCreateWithoutBookingsInputSchema';
import { EventOccurrenceCreateOrConnectWithoutBookingsInputSchema } from './EventOccurrenceCreateOrConnectWithoutBookingsInputSchema';
import { EventOccurrenceWhereUniqueInputSchema } from './EventOccurrenceWhereUniqueInputSchema';

export const EventOccurrenceCreateNestedOneWithoutBookingsInputSchema: z.ZodType<Prisma.EventOccurrenceCreateNestedOneWithoutBookingsInput> = z.object({
  create: z.union([ z.lazy(() => EventOccurrenceCreateWithoutBookingsInputSchema), z.lazy(() => EventOccurrenceUncheckedCreateWithoutBookingsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EventOccurrenceCreateOrConnectWithoutBookingsInputSchema).optional(),
  connect: z.lazy(() => EventOccurrenceWhereUniqueInputSchema).optional(),
}).strict();

export default EventOccurrenceCreateNestedOneWithoutBookingsInputSchema;
