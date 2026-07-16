import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventImageCreateWithoutEventInputSchema } from './EventImageCreateWithoutEventInputSchema';
import { EventImageUncheckedCreateWithoutEventInputSchema } from './EventImageUncheckedCreateWithoutEventInputSchema';
import { EventImageCreateOrConnectWithoutEventInputSchema } from './EventImageCreateOrConnectWithoutEventInputSchema';
import { EventImageUpsertWithWhereUniqueWithoutEventInputSchema } from './EventImageUpsertWithWhereUniqueWithoutEventInputSchema';
import { EventImageCreateManyEventInputEnvelopeSchema } from './EventImageCreateManyEventInputEnvelopeSchema';
import { EventImageWhereUniqueInputSchema } from './EventImageWhereUniqueInputSchema';
import { EventImageUpdateWithWhereUniqueWithoutEventInputSchema } from './EventImageUpdateWithWhereUniqueWithoutEventInputSchema';
import { EventImageUpdateManyWithWhereWithoutEventInputSchema } from './EventImageUpdateManyWithWhereWithoutEventInputSchema';
import { EventImageScalarWhereInputSchema } from './EventImageScalarWhereInputSchema';

export const EventImageUncheckedUpdateManyWithoutEventNestedInputSchema: z.ZodType<Prisma.EventImageUncheckedUpdateManyWithoutEventNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => EventImageCreateWithoutEventInputSchema), z.lazy(() => EventImageCreateWithoutEventInputSchema).array(), z.lazy(() => EventImageUncheckedCreateWithoutEventInputSchema), z.lazy(() => EventImageUncheckedCreateWithoutEventInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EventImageCreateOrConnectWithoutEventInputSchema), z.lazy(() => EventImageCreateOrConnectWithoutEventInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EventImageUpsertWithWhereUniqueWithoutEventInputSchema), z.lazy(() => EventImageUpsertWithWhereUniqueWithoutEventInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EventImageCreateManyEventInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EventImageWhereUniqueInputSchema), z.lazy(() => EventImageWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EventImageWhereUniqueInputSchema), z.lazy(() => EventImageWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EventImageWhereUniqueInputSchema), z.lazy(() => EventImageWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EventImageWhereUniqueInputSchema), z.lazy(() => EventImageWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EventImageUpdateWithWhereUniqueWithoutEventInputSchema), z.lazy(() => EventImageUpdateWithWhereUniqueWithoutEventInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EventImageUpdateManyWithWhereWithoutEventInputSchema), z.lazy(() => EventImageUpdateManyWithWhereWithoutEventInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EventImageScalarWhereInputSchema), z.lazy(() => EventImageScalarWhereInputSchema).array() ]).optional(),
});

export default EventImageUncheckedUpdateManyWithoutEventNestedInputSchema;
