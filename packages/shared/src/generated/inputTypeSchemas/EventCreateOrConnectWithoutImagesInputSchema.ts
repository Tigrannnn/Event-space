import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventCreateWithoutImagesInputSchema } from './EventCreateWithoutImagesInputSchema';
import { EventUncheckedCreateWithoutImagesInputSchema } from './EventUncheckedCreateWithoutImagesInputSchema';

export const EventCreateOrConnectWithoutImagesInputSchema: z.ZodType<Prisma.EventCreateOrConnectWithoutImagesInput> = z.object({
  where: z.lazy(() => EventWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EventCreateWithoutImagesInputSchema), z.lazy(() => EventUncheckedCreateWithoutImagesInputSchema) ]),
}).strict();

export default EventCreateOrConnectWithoutImagesInputSchema;
