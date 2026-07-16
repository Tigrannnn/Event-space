import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceCreateWithoutEventInputSchema } from './EventOccurrenceCreateWithoutEventInputSchema';
import { EventOccurrenceUncheckedCreateWithoutEventInputSchema } from './EventOccurrenceUncheckedCreateWithoutEventInputSchema';
import { EventOccurrenceCreateOrConnectWithoutEventInputSchema } from './EventOccurrenceCreateOrConnectWithoutEventInputSchema';
import { EventOccurrenceCreateManyEventInputEnvelopeSchema } from './EventOccurrenceCreateManyEventInputEnvelopeSchema';
import { EventOccurrenceWhereUniqueInputSchema } from './EventOccurrenceWhereUniqueInputSchema';

export const EventOccurrenceUncheckedCreateNestedManyWithoutEventInputSchema: z.ZodType<Prisma.EventOccurrenceUncheckedCreateNestedManyWithoutEventInput> = z.strictObject({
  create: z.union([ z.lazy(() => EventOccurrenceCreateWithoutEventInputSchema), z.lazy(() => EventOccurrenceCreateWithoutEventInputSchema).array(), z.lazy(() => EventOccurrenceUncheckedCreateWithoutEventInputSchema), z.lazy(() => EventOccurrenceUncheckedCreateWithoutEventInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EventOccurrenceCreateOrConnectWithoutEventInputSchema), z.lazy(() => EventOccurrenceCreateOrConnectWithoutEventInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EventOccurrenceCreateManyEventInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EventOccurrenceWhereUniqueInputSchema), z.lazy(() => EventOccurrenceWhereUniqueInputSchema).array() ]).optional(),
});

export default EventOccurrenceUncheckedCreateNestedManyWithoutEventInputSchema;
