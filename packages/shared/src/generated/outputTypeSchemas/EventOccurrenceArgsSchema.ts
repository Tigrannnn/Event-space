import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventOccurrenceSelectSchema } from '../inputTypeSchemas/EventOccurrenceSelectSchema';
import { EventOccurrenceIncludeSchema } from '../inputTypeSchemas/EventOccurrenceIncludeSchema';

export const EventOccurrenceArgsSchema: z.ZodType<Prisma.EventOccurrenceDefaultArgs> = z.object({
  select: z.lazy(() => EventOccurrenceSelectSchema).optional(),
  include: z.lazy(() => EventOccurrenceIncludeSchema).optional(),
}).strict();

export default EventOccurrenceArgsSchema;
