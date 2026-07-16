import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceCreateWithoutBookingsInputSchema } from './EventOccurrenceCreateWithoutBookingsInputSchema';
import { EventOccurrenceUncheckedCreateWithoutBookingsInputSchema } from './EventOccurrenceUncheckedCreateWithoutBookingsInputSchema';
import { EventOccurrenceCreateOrConnectWithoutBookingsInputSchema } from './EventOccurrenceCreateOrConnectWithoutBookingsInputSchema';
import { EventOccurrenceUpsertWithoutBookingsInputSchema } from './EventOccurrenceUpsertWithoutBookingsInputSchema';
import { EventOccurrenceWhereUniqueInputSchema } from './EventOccurrenceWhereUniqueInputSchema';
import { EventOccurrenceUpdateToOneWithWhereWithoutBookingsInputSchema } from './EventOccurrenceUpdateToOneWithWhereWithoutBookingsInputSchema';
import { EventOccurrenceUpdateWithoutBookingsInputSchema } from './EventOccurrenceUpdateWithoutBookingsInputSchema';
import { EventOccurrenceUncheckedUpdateWithoutBookingsInputSchema } from './EventOccurrenceUncheckedUpdateWithoutBookingsInputSchema';

export const EventOccurrenceUpdateOneRequiredWithoutBookingsNestedInputSchema: z.ZodType<Prisma.EventOccurrenceUpdateOneRequiredWithoutBookingsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => EventOccurrenceCreateWithoutBookingsInputSchema), z.lazy(() => EventOccurrenceUncheckedCreateWithoutBookingsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EventOccurrenceCreateOrConnectWithoutBookingsInputSchema).optional(),
  upsert: z.lazy(() => EventOccurrenceUpsertWithoutBookingsInputSchema).optional(),
  connect: z.lazy(() => EventOccurrenceWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => EventOccurrenceUpdateToOneWithWhereWithoutBookingsInputSchema), z.lazy(() => EventOccurrenceUpdateWithoutBookingsInputSchema), z.lazy(() => EventOccurrenceUncheckedUpdateWithoutBookingsInputSchema) ]).optional(),
});

export default EventOccurrenceUpdateOneRequiredWithoutBookingsNestedInputSchema;
