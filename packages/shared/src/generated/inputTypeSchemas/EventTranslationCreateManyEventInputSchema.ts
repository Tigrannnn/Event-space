import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';
import { EventTranslationCreatewhatsIncludedInputSchema } from './EventTranslationCreatewhatsIncludedInputSchema';

export const EventTranslationCreateManyEventInputSchema: z.ZodType<Prisma.EventTranslationCreateManyEventInput> = z.object({
  id: z.uuid().optional(),
  locale: z.lazy(() => LocaleSchema),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  whatsIncluded: z.union([ z.lazy(() => EventTranslationCreatewhatsIncludedInputSchema), z.string().array() ]).optional(),
}).strict();

export default EventTranslationCreateManyEventInputSchema;
