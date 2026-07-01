import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventOccurrenceCountOutputTypeSelectSchema } from './EventOccurrenceCountOutputTypeSelectSchema';

export const EventOccurrenceCountOutputTypeArgsSchema: z.ZodType<Prisma.EventOccurrenceCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => EventOccurrenceCountOutputTypeSelectSchema).nullish(),
}).strict();

export default EventOccurrenceCountOutputTypeSelectSchema;
