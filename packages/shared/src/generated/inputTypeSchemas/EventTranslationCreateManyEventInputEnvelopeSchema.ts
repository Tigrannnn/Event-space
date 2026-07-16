import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventTranslationCreateManyEventInputSchema } from './EventTranslationCreateManyEventInputSchema';

export const EventTranslationCreateManyEventInputEnvelopeSchema: z.ZodType<Prisma.EventTranslationCreateManyEventInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => EventTranslationCreateManyEventInputSchema), z.lazy(() => EventTranslationCreateManyEventInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export default EventTranslationCreateManyEventInputEnvelopeSchema;
