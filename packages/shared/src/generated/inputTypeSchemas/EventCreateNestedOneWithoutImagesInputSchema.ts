import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateWithoutImagesInputSchema } from './EventCreateWithoutImagesInputSchema';
import { EventUncheckedCreateWithoutImagesInputSchema } from './EventUncheckedCreateWithoutImagesInputSchema';
import { EventCreateOrConnectWithoutImagesInputSchema } from './EventCreateOrConnectWithoutImagesInputSchema';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';

export const EventCreateNestedOneWithoutImagesInputSchema: z.ZodType<Prisma.EventCreateNestedOneWithoutImagesInput> = z.strictObject({
  create: z.union([ z.lazy(() => EventCreateWithoutImagesInputSchema), z.lazy(() => EventUncheckedCreateWithoutImagesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EventCreateOrConnectWithoutImagesInputSchema).optional(),
  connect: z.lazy(() => EventWhereUniqueInputSchema).optional(),
});

export default EventCreateNestedOneWithoutImagesInputSchema;
