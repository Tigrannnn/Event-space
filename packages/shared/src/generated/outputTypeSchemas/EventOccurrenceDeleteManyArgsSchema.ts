import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventOccurrenceWhereInputSchema } from '../inputTypeSchemas/EventOccurrenceWhereInputSchema'

export const EventOccurrenceDeleteManyArgsSchema: z.ZodType<Prisma.EventOccurrenceDeleteManyArgs> = z.object({
  where: EventOccurrenceWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default EventOccurrenceDeleteManyArgsSchema;
