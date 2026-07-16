import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';

export const EventTranslationEventIdLocaleCompoundUniqueInputSchema: z.ZodType<Prisma.EventTranslationEventIdLocaleCompoundUniqueInput> = z.strictObject({
  eventId: z.string(),
  locale: z.lazy(() => LocaleSchema),
});

export default EventTranslationEventIdLocaleCompoundUniqueInputSchema;
