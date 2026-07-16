import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventScalarWhereInputSchema } from './EventScalarWhereInputSchema';
import { EventUpdateManyMutationInputSchema } from './EventUpdateManyMutationInputSchema';
import { EventUncheckedUpdateManyWithoutOrganizerInputSchema } from './EventUncheckedUpdateManyWithoutOrganizerInputSchema';

export const EventUpdateManyWithWhereWithoutOrganizerInputSchema: z.ZodType<Prisma.EventUpdateManyWithWhereWithoutOrganizerInput> = z.strictObject({
  where: z.lazy(() => EventScalarWhereInputSchema),
  data: z.union([ z.lazy(() => EventUpdateManyMutationInputSchema), z.lazy(() => EventUncheckedUpdateManyWithoutOrganizerInputSchema) ]),
});

export default EventUpdateManyWithWhereWithoutOrganizerInputSchema;
