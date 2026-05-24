import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventImageCreateWithoutEventInputSchema } from './EventImageCreateWithoutEventInputSchema';
import { EventImageUncheckedCreateWithoutEventInputSchema } from './EventImageUncheckedCreateWithoutEventInputSchema';
import { EventImageCreateOrConnectWithoutEventInputSchema } from './EventImageCreateOrConnectWithoutEventInputSchema';
import { EventImageCreateManyEventInputEnvelopeSchema } from './EventImageCreateManyEventInputEnvelopeSchema';
import { EventImageWhereUniqueInputSchema } from './EventImageWhereUniqueInputSchema';

export const EventImageUncheckedCreateNestedManyWithoutEventInputSchema: z.ZodType<Prisma.EventImageUncheckedCreateNestedManyWithoutEventInput> = z.object({
  create: z.union([ z.lazy(() => EventImageCreateWithoutEventInputSchema), z.lazy(() => EventImageCreateWithoutEventInputSchema).array(), z.lazy(() => EventImageUncheckedCreateWithoutEventInputSchema), z.lazy(() => EventImageUncheckedCreateWithoutEventInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EventImageCreateOrConnectWithoutEventInputSchema), z.lazy(() => EventImageCreateOrConnectWithoutEventInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EventImageCreateManyEventInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EventImageWhereUniqueInputSchema), z.lazy(() => EventImageWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default EventImageUncheckedCreateNestedManyWithoutEventInputSchema;
