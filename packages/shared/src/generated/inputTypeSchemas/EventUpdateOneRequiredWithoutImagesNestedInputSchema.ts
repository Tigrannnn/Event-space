import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateWithoutImagesInputSchema } from './EventCreateWithoutImagesInputSchema';
import { EventUncheckedCreateWithoutImagesInputSchema } from './EventUncheckedCreateWithoutImagesInputSchema';
import { EventCreateOrConnectWithoutImagesInputSchema } from './EventCreateOrConnectWithoutImagesInputSchema';
import { EventUpsertWithoutImagesInputSchema } from './EventUpsertWithoutImagesInputSchema';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventUpdateToOneWithWhereWithoutImagesInputSchema } from './EventUpdateToOneWithWhereWithoutImagesInputSchema';
import { EventUpdateWithoutImagesInputSchema } from './EventUpdateWithoutImagesInputSchema';
import { EventUncheckedUpdateWithoutImagesInputSchema } from './EventUncheckedUpdateWithoutImagesInputSchema';

export const EventUpdateOneRequiredWithoutImagesNestedInputSchema: z.ZodType<Prisma.EventUpdateOneRequiredWithoutImagesNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => EventCreateWithoutImagesInputSchema), z.lazy(() => EventUncheckedCreateWithoutImagesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EventCreateOrConnectWithoutImagesInputSchema).optional(),
  upsert: z.lazy(() => EventUpsertWithoutImagesInputSchema).optional(),
  connect: z.lazy(() => EventWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => EventUpdateToOneWithWhereWithoutImagesInputSchema), z.lazy(() => EventUpdateWithoutImagesInputSchema), z.lazy(() => EventUncheckedUpdateWithoutImagesInputSchema) ]).optional(),
});

export default EventUpdateOneRequiredWithoutImagesNestedInputSchema;
