import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventTranslationWhereUniqueInputSchema } from './EventTranslationWhereUniqueInputSchema';
import { EventTranslationUpdateWithoutEventInputSchema } from './EventTranslationUpdateWithoutEventInputSchema';
import { EventTranslationUncheckedUpdateWithoutEventInputSchema } from './EventTranslationUncheckedUpdateWithoutEventInputSchema';

export const EventTranslationUpdateWithWhereUniqueWithoutEventInputSchema: z.ZodType<Prisma.EventTranslationUpdateWithWhereUniqueWithoutEventInput> = z.strictObject({
  where: z.lazy(() => EventTranslationWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => EventTranslationUpdateWithoutEventInputSchema), z.lazy(() => EventTranslationUncheckedUpdateWithoutEventInputSchema) ]),
});

export default EventTranslationUpdateWithWhereUniqueWithoutEventInputSchema;
