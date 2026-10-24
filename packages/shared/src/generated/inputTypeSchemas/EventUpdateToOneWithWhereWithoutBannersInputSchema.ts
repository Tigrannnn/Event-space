import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereInputSchema } from './EventWhereInputSchema';
import { EventUpdateWithoutBannersInputSchema } from './EventUpdateWithoutBannersInputSchema';
import { EventUncheckedUpdateWithoutBannersInputSchema } from './EventUncheckedUpdateWithoutBannersInputSchema';

export const EventUpdateToOneWithWhereWithoutBannersInputSchema: z.ZodType<Prisma.EventUpdateToOneWithWhereWithoutBannersInput> = z.strictObject({
  where: z.lazy(() => EventWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => EventUpdateWithoutBannersInputSchema), z.lazy(() => EventUncheckedUpdateWithoutBannersInputSchema) ]),
});

export default EventUpdateToOneWithWhereWithoutBannersInputSchema;
