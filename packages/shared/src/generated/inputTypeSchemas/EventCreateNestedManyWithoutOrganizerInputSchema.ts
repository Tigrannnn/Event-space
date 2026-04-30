import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateWithoutOrganizerInputSchema } from './EventCreateWithoutOrganizerInputSchema';
import { EventUncheckedCreateWithoutOrganizerInputSchema } from './EventUncheckedCreateWithoutOrganizerInputSchema';
import { EventCreateOrConnectWithoutOrganizerInputSchema } from './EventCreateOrConnectWithoutOrganizerInputSchema';
import { EventCreateManyOrganizerInputEnvelopeSchema } from './EventCreateManyOrganizerInputEnvelopeSchema';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';

export const EventCreateNestedManyWithoutOrganizerInputSchema: z.ZodType<Prisma.EventCreateNestedManyWithoutOrganizerInput> = z.object({
  create: z.union([ z.lazy(() => EventCreateWithoutOrganizerInputSchema), z.lazy(() => EventCreateWithoutOrganizerInputSchema).array(), z.lazy(() => EventUncheckedCreateWithoutOrganizerInputSchema), z.lazy(() => EventUncheckedCreateWithoutOrganizerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EventCreateOrConnectWithoutOrganizerInputSchema), z.lazy(() => EventCreateOrConnectWithoutOrganizerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EventCreateManyOrganizerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EventWhereUniqueInputSchema), z.lazy(() => EventWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default EventCreateNestedManyWithoutOrganizerInputSchema;
