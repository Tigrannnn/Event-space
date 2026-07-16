import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceWhereInputSchema } from './EventOccurrenceWhereInputSchema';
import { EventOccurrenceUpdateWithoutBookingsInputSchema } from './EventOccurrenceUpdateWithoutBookingsInputSchema';
import { EventOccurrenceUncheckedUpdateWithoutBookingsInputSchema } from './EventOccurrenceUncheckedUpdateWithoutBookingsInputSchema';

export const EventOccurrenceUpdateToOneWithWhereWithoutBookingsInputSchema: z.ZodType<Prisma.EventOccurrenceUpdateToOneWithWhereWithoutBookingsInput> = z.strictObject({
  where: z.lazy(() => EventOccurrenceWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => EventOccurrenceUpdateWithoutBookingsInputSchema), z.lazy(() => EventOccurrenceUncheckedUpdateWithoutBookingsInputSchema) ]),
});

export default EventOccurrenceUpdateToOneWithWhereWithoutBookingsInputSchema;
