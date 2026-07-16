import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventUpdateWithoutImagesInputSchema } from './EventUpdateWithoutImagesInputSchema';
import { EventUncheckedUpdateWithoutImagesInputSchema } from './EventUncheckedUpdateWithoutImagesInputSchema';
import { EventCreateWithoutImagesInputSchema } from './EventCreateWithoutImagesInputSchema';
import { EventUncheckedCreateWithoutImagesInputSchema } from './EventUncheckedCreateWithoutImagesInputSchema';
import { EventWhereInputSchema } from './EventWhereInputSchema';

export const EventUpsertWithoutImagesInputSchema: z.ZodType<Prisma.EventUpsertWithoutImagesInput> = z.strictObject({
  update: z.union([ z.lazy(() => EventUpdateWithoutImagesInputSchema), z.lazy(() => EventUncheckedUpdateWithoutImagesInputSchema) ]),
  create: z.union([ z.lazy(() => EventCreateWithoutImagesInputSchema), z.lazy(() => EventUncheckedCreateWithoutImagesInputSchema) ]),
  where: z.lazy(() => EventWhereInputSchema).optional(),
});

export default EventUpsertWithoutImagesInputSchema;
