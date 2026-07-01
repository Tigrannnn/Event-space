import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventOccurrenceUpdateManyMutationInputSchema } from '../inputTypeSchemas/EventOccurrenceUpdateManyMutationInputSchema'
import { EventOccurrenceUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/EventOccurrenceUncheckedUpdateManyInputSchema'
import { EventOccurrenceWhereInputSchema } from '../inputTypeSchemas/EventOccurrenceWhereInputSchema'

export const EventOccurrenceUpdateManyArgsSchema: z.ZodType<Prisma.EventOccurrenceUpdateManyArgs> = z.object({
  data: z.union([ EventOccurrenceUpdateManyMutationInputSchema, EventOccurrenceUncheckedUpdateManyInputSchema ]),
  where: EventOccurrenceWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default EventOccurrenceUpdateManyArgsSchema;
