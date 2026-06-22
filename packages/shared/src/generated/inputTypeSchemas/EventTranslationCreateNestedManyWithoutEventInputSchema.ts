import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventTranslationCreateWithoutEventInputSchema } from './EventTranslationCreateWithoutEventInputSchema';
import { EventTranslationUncheckedCreateWithoutEventInputSchema } from './EventTranslationUncheckedCreateWithoutEventInputSchema';
import { EventTranslationCreateOrConnectWithoutEventInputSchema } from './EventTranslationCreateOrConnectWithoutEventInputSchema';
import { EventTranslationCreateManyEventInputEnvelopeSchema } from './EventTranslationCreateManyEventInputEnvelopeSchema';
import { EventTranslationWhereUniqueInputSchema } from './EventTranslationWhereUniqueInputSchema';

export const EventTranslationCreateNestedManyWithoutEventInputSchema: z.ZodType<Prisma.EventTranslationCreateNestedManyWithoutEventInput> = z.object({
  create: z.union([ z.lazy(() => EventTranslationCreateWithoutEventInputSchema), z.lazy(() => EventTranslationCreateWithoutEventInputSchema).array(), z.lazy(() => EventTranslationUncheckedCreateWithoutEventInputSchema), z.lazy(() => EventTranslationUncheckedCreateWithoutEventInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EventTranslationCreateOrConnectWithoutEventInputSchema), z.lazy(() => EventTranslationCreateOrConnectWithoutEventInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EventTranslationCreateManyEventInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EventTranslationWhereUniqueInputSchema), z.lazy(() => EventTranslationWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default EventTranslationCreateNestedManyWithoutEventInputSchema;
