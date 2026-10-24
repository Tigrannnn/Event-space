import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventCreateWithoutBannersInputSchema } from './EventCreateWithoutBannersInputSchema';
import { EventUncheckedCreateWithoutBannersInputSchema } from './EventUncheckedCreateWithoutBannersInputSchema';

export const EventCreateOrConnectWithoutBannersInputSchema: z.ZodType<Prisma.EventCreateOrConnectWithoutBannersInput> = z.strictObject({
  where: z.lazy(() => EventWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EventCreateWithoutBannersInputSchema), z.lazy(() => EventUncheckedCreateWithoutBannersInputSchema) ]),
});

export default EventCreateOrConnectWithoutBannersInputSchema;
