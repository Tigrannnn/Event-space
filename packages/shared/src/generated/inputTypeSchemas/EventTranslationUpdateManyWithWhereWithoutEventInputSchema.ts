import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventTranslationScalarWhereInputSchema } from './EventTranslationScalarWhereInputSchema';
import { EventTranslationUpdateManyMutationInputSchema } from './EventTranslationUpdateManyMutationInputSchema';
import { EventTranslationUncheckedUpdateManyWithoutEventInputSchema } from './EventTranslationUncheckedUpdateManyWithoutEventInputSchema';

export const EventTranslationUpdateManyWithWhereWithoutEventInputSchema: z.ZodType<Prisma.EventTranslationUpdateManyWithWhereWithoutEventInput> = z.object({
  where: z.lazy(() => EventTranslationScalarWhereInputSchema),
  data: z.union([ z.lazy(() => EventTranslationUpdateManyMutationInputSchema), z.lazy(() => EventTranslationUncheckedUpdateManyWithoutEventInputSchema) ]),
}).strict();

export default EventTranslationUpdateManyWithWhereWithoutEventInputSchema;
