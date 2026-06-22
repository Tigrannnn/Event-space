import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventTranslationWhereUniqueInputSchema } from './EventTranslationWhereUniqueInputSchema';
import { EventTranslationUpdateWithoutEventInputSchema } from './EventTranslationUpdateWithoutEventInputSchema';
import { EventTranslationUncheckedUpdateWithoutEventInputSchema } from './EventTranslationUncheckedUpdateWithoutEventInputSchema';
import { EventTranslationCreateWithoutEventInputSchema } from './EventTranslationCreateWithoutEventInputSchema';
import { EventTranslationUncheckedCreateWithoutEventInputSchema } from './EventTranslationUncheckedCreateWithoutEventInputSchema';

export const EventTranslationUpsertWithWhereUniqueWithoutEventInputSchema: z.ZodType<Prisma.EventTranslationUpsertWithWhereUniqueWithoutEventInput> = z.object({
  where: z.lazy(() => EventTranslationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => EventTranslationUpdateWithoutEventInputSchema), z.lazy(() => EventTranslationUncheckedUpdateWithoutEventInputSchema) ]),
  create: z.union([ z.lazy(() => EventTranslationCreateWithoutEventInputSchema), z.lazy(() => EventTranslationUncheckedCreateWithoutEventInputSchema) ]),
}).strict();

export default EventTranslationUpsertWithWhereUniqueWithoutEventInputSchema;
