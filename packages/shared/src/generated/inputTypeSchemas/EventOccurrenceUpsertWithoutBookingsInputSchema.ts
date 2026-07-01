import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceUpdateWithoutBookingsInputSchema } from './EventOccurrenceUpdateWithoutBookingsInputSchema';
import { EventOccurrenceUncheckedUpdateWithoutBookingsInputSchema } from './EventOccurrenceUncheckedUpdateWithoutBookingsInputSchema';
import { EventOccurrenceCreateWithoutBookingsInputSchema } from './EventOccurrenceCreateWithoutBookingsInputSchema';
import { EventOccurrenceUncheckedCreateWithoutBookingsInputSchema } from './EventOccurrenceUncheckedCreateWithoutBookingsInputSchema';
import { EventOccurrenceWhereInputSchema } from './EventOccurrenceWhereInputSchema';

export const EventOccurrenceUpsertWithoutBookingsInputSchema: z.ZodType<Prisma.EventOccurrenceUpsertWithoutBookingsInput> = z.object({
  update: z.union([ z.lazy(() => EventOccurrenceUpdateWithoutBookingsInputSchema), z.lazy(() => EventOccurrenceUncheckedUpdateWithoutBookingsInputSchema) ]),
  create: z.union([ z.lazy(() => EventOccurrenceCreateWithoutBookingsInputSchema), z.lazy(() => EventOccurrenceUncheckedCreateWithoutBookingsInputSchema) ]),
  where: z.lazy(() => EventOccurrenceWhereInputSchema).optional(),
}).strict();

export default EventOccurrenceUpsertWithoutBookingsInputSchema;
