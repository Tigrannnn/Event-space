import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateWithoutBookingsInputSchema } from './EventCreateWithoutBookingsInputSchema';
import { EventUncheckedCreateWithoutBookingsInputSchema } from './EventUncheckedCreateWithoutBookingsInputSchema';
import { EventCreateOrConnectWithoutBookingsInputSchema } from './EventCreateOrConnectWithoutBookingsInputSchema';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';

export const EventCreateNestedOneWithoutBookingsInputSchema: z.ZodType<Prisma.EventCreateNestedOneWithoutBookingsInput> = z.object({
  create: z.union([ z.lazy(() => EventCreateWithoutBookingsInputSchema), z.lazy(() => EventUncheckedCreateWithoutBookingsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EventCreateOrConnectWithoutBookingsInputSchema).optional(),
  connect: z.lazy(() => EventWhereUniqueInputSchema).optional(),
}).strict();

export default EventCreateNestedOneWithoutBookingsInputSchema;
