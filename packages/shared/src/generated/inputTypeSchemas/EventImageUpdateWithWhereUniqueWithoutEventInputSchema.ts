import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventImageWhereUniqueInputSchema } from './EventImageWhereUniqueInputSchema';
import { EventImageUpdateWithoutEventInputSchema } from './EventImageUpdateWithoutEventInputSchema';
import { EventImageUncheckedUpdateWithoutEventInputSchema } from './EventImageUncheckedUpdateWithoutEventInputSchema';

export const EventImageUpdateWithWhereUniqueWithoutEventInputSchema: z.ZodType<Prisma.EventImageUpdateWithWhereUniqueWithoutEventInput> = z.strictObject({
  where: z.lazy(() => EventImageWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => EventImageUpdateWithoutEventInputSchema), z.lazy(() => EventImageUncheckedUpdateWithoutEventInputSchema) ]),
});

export default EventImageUpdateWithWhereUniqueWithoutEventInputSchema;
