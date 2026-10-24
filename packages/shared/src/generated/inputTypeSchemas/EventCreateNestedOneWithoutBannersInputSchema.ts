import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateWithoutBannersInputSchema } from './EventCreateWithoutBannersInputSchema';
import { EventUncheckedCreateWithoutBannersInputSchema } from './EventUncheckedCreateWithoutBannersInputSchema';
import { EventCreateOrConnectWithoutBannersInputSchema } from './EventCreateOrConnectWithoutBannersInputSchema';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';

export const EventCreateNestedOneWithoutBannersInputSchema: z.ZodType<Prisma.EventCreateNestedOneWithoutBannersInput> = z.strictObject({
  create: z.union([ z.lazy(() => EventCreateWithoutBannersInputSchema), z.lazy(() => EventUncheckedCreateWithoutBannersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EventCreateOrConnectWithoutBannersInputSchema).optional(),
  connect: z.lazy(() => EventWhereUniqueInputSchema).optional(),
});

export default EventCreateNestedOneWithoutBannersInputSchema;
