import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';

export const EventTranslationEventIdLocaleCompoundUniqueInputSchema: z.ZodType<Prisma.EventTranslationEventIdLocaleCompoundUniqueInput> = z.object({
  eventId: z.string(),
  locale: z.lazy(() => LocaleSchema),
}).strict();

export default EventTranslationEventIdLocaleCompoundUniqueInputSchema;
