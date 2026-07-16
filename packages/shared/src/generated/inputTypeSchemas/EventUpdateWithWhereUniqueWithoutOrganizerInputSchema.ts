import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventUpdateWithoutOrganizerInputSchema } from './EventUpdateWithoutOrganizerInputSchema';
import { EventUncheckedUpdateWithoutOrganizerInputSchema } from './EventUncheckedUpdateWithoutOrganizerInputSchema';

export const EventUpdateWithWhereUniqueWithoutOrganizerInputSchema: z.ZodType<Prisma.EventUpdateWithWhereUniqueWithoutOrganizerInput> = z.strictObject({
  where: z.lazy(() => EventWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => EventUpdateWithoutOrganizerInputSchema), z.lazy(() => EventUncheckedUpdateWithoutOrganizerInputSchema) ]),
});

export default EventUpdateWithWhereUniqueWithoutOrganizerInputSchema;
