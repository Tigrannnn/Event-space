import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventOccurrenceCreateManyInputSchema } from '../inputTypeSchemas/EventOccurrenceCreateManyInputSchema'

export const EventOccurrenceCreateManyAndReturnArgsSchema: z.ZodType<Prisma.EventOccurrenceCreateManyAndReturnArgs> = z.object({
  data: z.union([ EventOccurrenceCreateManyInputSchema, EventOccurrenceCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default EventOccurrenceCreateManyAndReturnArgsSchema;
