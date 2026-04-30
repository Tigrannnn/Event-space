import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereInputSchema } from './EventWhereInputSchema';
import { EventUpdateWithoutBookingsInputSchema } from './EventUpdateWithoutBookingsInputSchema';
import { EventUncheckedUpdateWithoutBookingsInputSchema } from './EventUncheckedUpdateWithoutBookingsInputSchema';

export const EventUpdateToOneWithWhereWithoutBookingsInputSchema: z.ZodType<Prisma.EventUpdateToOneWithWhereWithoutBookingsInput> = z.object({
  where: z.lazy(() => EventWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => EventUpdateWithoutBookingsInputSchema), z.lazy(() => EventUncheckedUpdateWithoutBookingsInputSchema) ]),
}).strict();

export default EventUpdateToOneWithWhereWithoutBookingsInputSchema;
