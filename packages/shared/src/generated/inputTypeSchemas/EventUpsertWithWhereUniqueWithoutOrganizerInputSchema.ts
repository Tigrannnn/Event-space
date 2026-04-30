import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventUpdateWithoutOrganizerInputSchema } from './EventUpdateWithoutOrganizerInputSchema';
import { EventUncheckedUpdateWithoutOrganizerInputSchema } from './EventUncheckedUpdateWithoutOrganizerInputSchema';
import { EventCreateWithoutOrganizerInputSchema } from './EventCreateWithoutOrganizerInputSchema';
import { EventUncheckedCreateWithoutOrganizerInputSchema } from './EventUncheckedCreateWithoutOrganizerInputSchema';

export const EventUpsertWithWhereUniqueWithoutOrganizerInputSchema: z.ZodType<Prisma.EventUpsertWithWhereUniqueWithoutOrganizerInput> = z.object({
  where: z.lazy(() => EventWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => EventUpdateWithoutOrganizerInputSchema), z.lazy(() => EventUncheckedUpdateWithoutOrganizerInputSchema) ]),
  create: z.union([ z.lazy(() => EventCreateWithoutOrganizerInputSchema), z.lazy(() => EventUncheckedCreateWithoutOrganizerInputSchema) ]),
}).strict();

export default EventUpsertWithWhereUniqueWithoutOrganizerInputSchema;
