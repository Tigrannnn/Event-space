import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';
import { EventTranslationCreatewhatsIncludedInputSchema } from './EventTranslationCreatewhatsIncludedInputSchema';

export const EventTranslationUncheckedCreateWithoutEventInputSchema: z.ZodType<Prisma.EventTranslationUncheckedCreateWithoutEventInput> = z.strictObject({
  id: z.uuid().optional(),
  locale: z.lazy(() => LocaleSchema),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  whatsIncluded: z.union([ z.lazy(() => EventTranslationCreatewhatsIncludedInputSchema), z.string().array() ]).optional(),
});

export default EventTranslationUncheckedCreateWithoutEventInputSchema;
