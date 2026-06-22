import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventTranslationSelectSchema } from '../inputTypeSchemas/EventTranslationSelectSchema';
import { EventTranslationIncludeSchema } from '../inputTypeSchemas/EventTranslationIncludeSchema';

export const EventTranslationArgsSchema: z.ZodType<Prisma.EventTranslationDefaultArgs> = z.object({
  select: z.lazy(() => EventTranslationSelectSchema).optional(),
  include: z.lazy(() => EventTranslationIncludeSchema).optional(),
}).strict();

export default EventTranslationArgsSchema;
