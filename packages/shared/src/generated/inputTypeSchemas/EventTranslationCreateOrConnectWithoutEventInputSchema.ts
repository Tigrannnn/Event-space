import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventTranslationWhereUniqueInputSchema } from './EventTranslationWhereUniqueInputSchema';
import { EventTranslationCreateWithoutEventInputSchema } from './EventTranslationCreateWithoutEventInputSchema';
import { EventTranslationUncheckedCreateWithoutEventInputSchema } from './EventTranslationUncheckedCreateWithoutEventInputSchema';

export const EventTranslationCreateOrConnectWithoutEventInputSchema: z.ZodType<Prisma.EventTranslationCreateOrConnectWithoutEventInput> = z.strictObject({
  where: z.lazy(() => EventTranslationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EventTranslationCreateWithoutEventInputSchema), z.lazy(() => EventTranslationUncheckedCreateWithoutEventInputSchema) ]),
});

export default EventTranslationCreateOrConnectWithoutEventInputSchema;
