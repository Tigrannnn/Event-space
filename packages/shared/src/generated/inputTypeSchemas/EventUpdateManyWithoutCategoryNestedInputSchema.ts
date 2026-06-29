import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateWithoutCategoryInputSchema } from './EventCreateWithoutCategoryInputSchema';
import { EventUncheckedCreateWithoutCategoryInputSchema } from './EventUncheckedCreateWithoutCategoryInputSchema';
import { EventCreateOrConnectWithoutCategoryInputSchema } from './EventCreateOrConnectWithoutCategoryInputSchema';
import { EventUpsertWithWhereUniqueWithoutCategoryInputSchema } from './EventUpsertWithWhereUniqueWithoutCategoryInputSchema';
import { EventCreateManyCategoryInputEnvelopeSchema } from './EventCreateManyCategoryInputEnvelopeSchema';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventUpdateWithWhereUniqueWithoutCategoryInputSchema } from './EventUpdateWithWhereUniqueWithoutCategoryInputSchema';
import { EventUpdateManyWithWhereWithoutCategoryInputSchema } from './EventUpdateManyWithWhereWithoutCategoryInputSchema';
import { EventScalarWhereInputSchema } from './EventScalarWhereInputSchema';

export const EventUpdateManyWithoutCategoryNestedInputSchema: z.ZodType<Prisma.EventUpdateManyWithoutCategoryNestedInput> = z.object({
  create: z.union([ z.lazy(() => EventCreateWithoutCategoryInputSchema), z.lazy(() => EventCreateWithoutCategoryInputSchema).array(), z.lazy(() => EventUncheckedCreateWithoutCategoryInputSchema), z.lazy(() => EventUncheckedCreateWithoutCategoryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EventCreateOrConnectWithoutCategoryInputSchema), z.lazy(() => EventCreateOrConnectWithoutCategoryInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EventUpsertWithWhereUniqueWithoutCategoryInputSchema), z.lazy(() => EventUpsertWithWhereUniqueWithoutCategoryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EventCreateManyCategoryInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EventWhereUniqueInputSchema), z.lazy(() => EventWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EventWhereUniqueInputSchema), z.lazy(() => EventWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EventWhereUniqueInputSchema), z.lazy(() => EventWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EventWhereUniqueInputSchema), z.lazy(() => EventWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EventUpdateWithWhereUniqueWithoutCategoryInputSchema), z.lazy(() => EventUpdateWithWhereUniqueWithoutCategoryInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EventUpdateManyWithWhereWithoutCategoryInputSchema), z.lazy(() => EventUpdateManyWithWhereWithoutCategoryInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EventScalarWhereInputSchema), z.lazy(() => EventScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default EventUpdateManyWithoutCategoryNestedInputSchema;
