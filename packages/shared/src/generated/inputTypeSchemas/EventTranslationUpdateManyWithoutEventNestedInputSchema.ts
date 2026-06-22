import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventTranslationCreateWithoutEventInputSchema } from './EventTranslationCreateWithoutEventInputSchema';
import { EventTranslationUncheckedCreateWithoutEventInputSchema } from './EventTranslationUncheckedCreateWithoutEventInputSchema';
import { EventTranslationCreateOrConnectWithoutEventInputSchema } from './EventTranslationCreateOrConnectWithoutEventInputSchema';
import { EventTranslationUpsertWithWhereUniqueWithoutEventInputSchema } from './EventTranslationUpsertWithWhereUniqueWithoutEventInputSchema';
import { EventTranslationCreateManyEventInputEnvelopeSchema } from './EventTranslationCreateManyEventInputEnvelopeSchema';
import { EventTranslationWhereUniqueInputSchema } from './EventTranslationWhereUniqueInputSchema';
import { EventTranslationUpdateWithWhereUniqueWithoutEventInputSchema } from './EventTranslationUpdateWithWhereUniqueWithoutEventInputSchema';
import { EventTranslationUpdateManyWithWhereWithoutEventInputSchema } from './EventTranslationUpdateManyWithWhereWithoutEventInputSchema';
import { EventTranslationScalarWhereInputSchema } from './EventTranslationScalarWhereInputSchema';

export const EventTranslationUpdateManyWithoutEventNestedInputSchema: z.ZodType<Prisma.EventTranslationUpdateManyWithoutEventNestedInput> = z.object({
  create: z.union([ z.lazy(() => EventTranslationCreateWithoutEventInputSchema), z.lazy(() => EventTranslationCreateWithoutEventInputSchema).array(), z.lazy(() => EventTranslationUncheckedCreateWithoutEventInputSchema), z.lazy(() => EventTranslationUncheckedCreateWithoutEventInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EventTranslationCreateOrConnectWithoutEventInputSchema), z.lazy(() => EventTranslationCreateOrConnectWithoutEventInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EventTranslationUpsertWithWhereUniqueWithoutEventInputSchema), z.lazy(() => EventTranslationUpsertWithWhereUniqueWithoutEventInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EventTranslationCreateManyEventInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EventTranslationWhereUniqueInputSchema), z.lazy(() => EventTranslationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EventTranslationWhereUniqueInputSchema), z.lazy(() => EventTranslationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EventTranslationWhereUniqueInputSchema), z.lazy(() => EventTranslationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EventTranslationWhereUniqueInputSchema), z.lazy(() => EventTranslationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EventTranslationUpdateWithWhereUniqueWithoutEventInputSchema), z.lazy(() => EventTranslationUpdateWithWhereUniqueWithoutEventInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EventTranslationUpdateManyWithWhereWithoutEventInputSchema), z.lazy(() => EventTranslationUpdateManyWithWhereWithoutEventInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EventTranslationScalarWhereInputSchema), z.lazy(() => EventTranslationScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default EventTranslationUpdateManyWithoutEventNestedInputSchema;
