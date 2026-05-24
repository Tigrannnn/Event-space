import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventImageWhereUniqueInputSchema } from './EventImageWhereUniqueInputSchema';
import { EventImageCreateWithoutEventInputSchema } from './EventImageCreateWithoutEventInputSchema';
import { EventImageUncheckedCreateWithoutEventInputSchema } from './EventImageUncheckedCreateWithoutEventInputSchema';

export const EventImageCreateOrConnectWithoutEventInputSchema: z.ZodType<Prisma.EventImageCreateOrConnectWithoutEventInput> = z.object({
  where: z.lazy(() => EventImageWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EventImageCreateWithoutEventInputSchema), z.lazy(() => EventImageUncheckedCreateWithoutEventInputSchema) ]),
}).strict();

export default EventImageCreateOrConnectWithoutEventInputSchema;
