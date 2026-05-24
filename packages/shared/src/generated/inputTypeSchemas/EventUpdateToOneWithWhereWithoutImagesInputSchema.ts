import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereInputSchema } from './EventWhereInputSchema';
import { EventUpdateWithoutImagesInputSchema } from './EventUpdateWithoutImagesInputSchema';
import { EventUncheckedUpdateWithoutImagesInputSchema } from './EventUncheckedUpdateWithoutImagesInputSchema';

export const EventUpdateToOneWithWhereWithoutImagesInputSchema: z.ZodType<Prisma.EventUpdateToOneWithWhereWithoutImagesInput> = z.object({
  where: z.lazy(() => EventWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => EventUpdateWithoutImagesInputSchema), z.lazy(() => EventUncheckedUpdateWithoutImagesInputSchema) ]),
}).strict();

export default EventUpdateToOneWithWhereWithoutImagesInputSchema;
