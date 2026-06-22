import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';
import { EventTranslationCreatewhatsIncludedInputSchema } from './EventTranslationCreatewhatsIncludedInputSchema';
import { EventCreateNestedOneWithoutTranslationsInputSchema } from './EventCreateNestedOneWithoutTranslationsInputSchema';

export const EventTranslationCreateInputSchema: z.ZodType<Prisma.EventTranslationCreateInput> = z.object({
  id: z.uuid().optional(),
  locale: z.lazy(() => LocaleSchema),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  category: z.string(),
  whatsIncluded: z.union([ z.lazy(() => EventTranslationCreatewhatsIncludedInputSchema), z.string().array() ]).optional(),
  event: z.lazy(() => EventCreateNestedOneWithoutTranslationsInputSchema),
}).strict();

export default EventTranslationCreateInputSchema;
