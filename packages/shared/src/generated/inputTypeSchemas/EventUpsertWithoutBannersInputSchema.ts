import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventUpdateWithoutBannersInputSchema } from './EventUpdateWithoutBannersInputSchema';
import { EventUncheckedUpdateWithoutBannersInputSchema } from './EventUncheckedUpdateWithoutBannersInputSchema';
import { EventCreateWithoutBannersInputSchema } from './EventCreateWithoutBannersInputSchema';
import { EventUncheckedCreateWithoutBannersInputSchema } from './EventUncheckedCreateWithoutBannersInputSchema';
import { EventWhereInputSchema } from './EventWhereInputSchema';

export const EventUpsertWithoutBannersInputSchema: z.ZodType<Prisma.EventUpsertWithoutBannersInput> = z.strictObject({
  update: z.union([ z.lazy(() => EventUpdateWithoutBannersInputSchema), z.lazy(() => EventUncheckedUpdateWithoutBannersInputSchema) ]),
  create: z.union([ z.lazy(() => EventCreateWithoutBannersInputSchema), z.lazy(() => EventUncheckedCreateWithoutBannersInputSchema) ]),
  where: z.lazy(() => EventWhereInputSchema).optional(),
});

export default EventUpsertWithoutBannersInputSchema;
