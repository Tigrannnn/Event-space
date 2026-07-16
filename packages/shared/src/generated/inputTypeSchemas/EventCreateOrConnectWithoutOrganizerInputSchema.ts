import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventCreateWithoutOrganizerInputSchema } from './EventCreateWithoutOrganizerInputSchema';
import { EventUncheckedCreateWithoutOrganizerInputSchema } from './EventUncheckedCreateWithoutOrganizerInputSchema';

export const EventCreateOrConnectWithoutOrganizerInputSchema: z.ZodType<Prisma.EventCreateOrConnectWithoutOrganizerInput> = z.strictObject({
  where: z.lazy(() => EventWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EventCreateWithoutOrganizerInputSchema), z.lazy(() => EventUncheckedCreateWithoutOrganizerInputSchema) ]),
});

export default EventCreateOrConnectWithoutOrganizerInputSchema;
