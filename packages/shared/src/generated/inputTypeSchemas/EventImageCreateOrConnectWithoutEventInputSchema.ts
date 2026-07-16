import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventImageWhereUniqueInputSchema } from './EventImageWhereUniqueInputSchema';
import { EventImageCreateWithoutEventInputSchema } from './EventImageCreateWithoutEventInputSchema';
import { EventImageUncheckedCreateWithoutEventInputSchema } from './EventImageUncheckedCreateWithoutEventInputSchema';

export const EventImageCreateOrConnectWithoutEventInputSchema: z.ZodType<Prisma.EventImageCreateOrConnectWithoutEventInput> = z.strictObject({
  where: z.lazy(() => EventImageWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EventImageCreateWithoutEventInputSchema), z.lazy(() => EventImageUncheckedCreateWithoutEventInputSchema) ]),
});

export default EventImageCreateOrConnectWithoutEventInputSchema;
