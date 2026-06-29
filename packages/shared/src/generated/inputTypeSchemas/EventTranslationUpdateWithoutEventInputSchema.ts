import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { LocaleSchema } from './LocaleSchema';
import { EnumLocaleFieldUpdateOperationsInputSchema } from './EnumLocaleFieldUpdateOperationsInputSchema';
import { EventTranslationUpdatewhatsIncludedInputSchema } from './EventTranslationUpdatewhatsIncludedInputSchema';

export const EventTranslationUpdateWithoutEventInputSchema: z.ZodType<Prisma.EventTranslationUpdateWithoutEventInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  locale: z.union([ z.lazy(() => LocaleSchema), z.lazy(() => EnumLocaleFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  location: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  whatsIncluded: z.union([ z.lazy(() => EventTranslationUpdatewhatsIncludedInputSchema), z.string().array() ]).optional(),
}).strict();

export default EventTranslationUpdateWithoutEventInputSchema;
