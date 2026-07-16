import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';
import { EventTranslationCreatewhatsIncludedInputSchema } from './EventTranslationCreatewhatsIncludedInputSchema';

export const EventTranslationCreateManyInputSchema: z.ZodType<Prisma.EventTranslationCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  eventId: z.string(),
  locale: z.lazy(() => LocaleSchema),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  whatsIncluded: z.union([ z.lazy(() => EventTranslationCreatewhatsIncludedInputSchema), z.string().array() ]).optional(),
});

export default EventTranslationCreateManyInputSchema;
