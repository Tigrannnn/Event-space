import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceCreateWithoutEventInputSchema } from './EventOccurrenceCreateWithoutEventInputSchema';
import { EventOccurrenceUncheckedCreateWithoutEventInputSchema } from './EventOccurrenceUncheckedCreateWithoutEventInputSchema';
import { EventOccurrenceCreateOrConnectWithoutEventInputSchema } from './EventOccurrenceCreateOrConnectWithoutEventInputSchema';
import { EventOccurrenceUpsertWithWhereUniqueWithoutEventInputSchema } from './EventOccurrenceUpsertWithWhereUniqueWithoutEventInputSchema';
import { EventOccurrenceCreateManyEventInputEnvelopeSchema } from './EventOccurrenceCreateManyEventInputEnvelopeSchema';
import { EventOccurrenceWhereUniqueInputSchema } from './EventOccurrenceWhereUniqueInputSchema';
import { EventOccurrenceUpdateWithWhereUniqueWithoutEventInputSchema } from './EventOccurrenceUpdateWithWhereUniqueWithoutEventInputSchema';
import { EventOccurrenceUpdateManyWithWhereWithoutEventInputSchema } from './EventOccurrenceUpdateManyWithWhereWithoutEventInputSchema';
import { EventOccurrenceScalarWhereInputSchema } from './EventOccurrenceScalarWhereInputSchema';

export const EventOccurrenceUpdateManyWithoutEventNestedInputSchema: z.ZodType<Prisma.EventOccurrenceUpdateManyWithoutEventNestedInput> = z.object({
  create: z.union([ z.lazy(() => EventOccurrenceCreateWithoutEventInputSchema), z.lazy(() => EventOccurrenceCreateWithoutEventInputSchema).array(), z.lazy(() => EventOccurrenceUncheckedCreateWithoutEventInputSchema), z.lazy(() => EventOccurrenceUncheckedCreateWithoutEventInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EventOccurrenceCreateOrConnectWithoutEventInputSchema), z.lazy(() => EventOccurrenceCreateOrConnectWithoutEventInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EventOccurrenceUpsertWithWhereUniqueWithoutEventInputSchema), z.lazy(() => EventOccurrenceUpsertWithWhereUniqueWithoutEventInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EventOccurrenceCreateManyEventInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EventOccurrenceWhereUniqueInputSchema), z.lazy(() => EventOccurrenceWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EventOccurrenceWhereUniqueInputSchema), z.lazy(() => EventOccurrenceWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EventOccurrenceWhereUniqueInputSchema), z.lazy(() => EventOccurrenceWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EventOccurrenceWhereUniqueInputSchema), z.lazy(() => EventOccurrenceWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EventOccurrenceUpdateWithWhereUniqueWithoutEventInputSchema), z.lazy(() => EventOccurrenceUpdateWithWhereUniqueWithoutEventInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EventOccurrenceUpdateManyWithWhereWithoutEventInputSchema), z.lazy(() => EventOccurrenceUpdateManyWithWhereWithoutEventInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EventOccurrenceScalarWhereInputSchema), z.lazy(() => EventOccurrenceScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default EventOccurrenceUpdateManyWithoutEventNestedInputSchema;
