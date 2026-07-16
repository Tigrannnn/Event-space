import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventCreateWithoutImagesInputSchema } from './EventCreateWithoutImagesInputSchema';
import { EventUncheckedCreateWithoutImagesInputSchema } from './EventUncheckedCreateWithoutImagesInputSchema';

export const EventCreateOrConnectWithoutImagesInputSchema: z.ZodType<Prisma.EventCreateOrConnectWithoutImagesInput> = z.strictObject({
  where: z.lazy(() => EventWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EventCreateWithoutImagesInputSchema), z.lazy(() => EventUncheckedCreateWithoutImagesInputSchema) ]),
});

export default EventCreateOrConnectWithoutImagesInputSchema;
