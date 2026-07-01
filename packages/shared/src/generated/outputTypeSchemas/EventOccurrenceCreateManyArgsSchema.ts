import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventOccurrenceCreateManyInputSchema } from '../inputTypeSchemas/EventOccurrenceCreateManyInputSchema'

export const EventOccurrenceCreateManyArgsSchema: z.ZodType<Prisma.EventOccurrenceCreateManyArgs> = z.object({
  data: z.union([ EventOccurrenceCreateManyInputSchema, EventOccurrenceCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default EventOccurrenceCreateManyArgsSchema;
