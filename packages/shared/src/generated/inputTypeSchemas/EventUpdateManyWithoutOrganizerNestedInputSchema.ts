import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateWithoutOrganizerInputSchema } from './EventCreateWithoutOrganizerInputSchema';
import { EventUncheckedCreateWithoutOrganizerInputSchema } from './EventUncheckedCreateWithoutOrganizerInputSchema';
import { EventCreateOrConnectWithoutOrganizerInputSchema } from './EventCreateOrConnectWithoutOrganizerInputSchema';
import { EventUpsertWithWhereUniqueWithoutOrganizerInputSchema } from './EventUpsertWithWhereUniqueWithoutOrganizerInputSchema';
import { EventCreateManyOrganizerInputEnvelopeSchema } from './EventCreateManyOrganizerInputEnvelopeSchema';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventUpdateWithWhereUniqueWithoutOrganizerInputSchema } from './EventUpdateWithWhereUniqueWithoutOrganizerInputSchema';
import { EventUpdateManyWithWhereWithoutOrganizerInputSchema } from './EventUpdateManyWithWhereWithoutOrganizerInputSchema';
import { EventScalarWhereInputSchema } from './EventScalarWhereInputSchema';

export const EventUpdateManyWithoutOrganizerNestedInputSchema: z.ZodType<Prisma.EventUpdateManyWithoutOrganizerNestedInput> = z.object({
  create: z.union([ z.lazy(() => EventCreateWithoutOrganizerInputSchema), z.lazy(() => EventCreateWithoutOrganizerInputSchema).array(), z.lazy(() => EventUncheckedCreateWithoutOrganizerInputSchema), z.lazy(() => EventUncheckedCreateWithoutOrganizerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EventCreateOrConnectWithoutOrganizerInputSchema), z.lazy(() => EventCreateOrConnectWithoutOrganizerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EventUpsertWithWhereUniqueWithoutOrganizerInputSchema), z.lazy(() => EventUpsertWithWhereUniqueWithoutOrganizerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EventCreateManyOrganizerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EventWhereUniqueInputSchema), z.lazy(() => EventWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EventWhereUniqueInputSchema), z.lazy(() => EventWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EventWhereUniqueInputSchema), z.lazy(() => EventWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EventWhereUniqueInputSchema), z.lazy(() => EventWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EventUpdateWithWhereUniqueWithoutOrganizerInputSchema), z.lazy(() => EventUpdateWithWhereUniqueWithoutOrganizerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EventUpdateManyWithWhereWithoutOrganizerInputSchema), z.lazy(() => EventUpdateManyWithWhereWithoutOrganizerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EventScalarWhereInputSchema), z.lazy(() => EventScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default EventUpdateManyWithoutOrganizerNestedInputSchema;
