import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventOccurrenceWhereInputSchema } from '../inputTypeSchemas/EventOccurrenceWhereInputSchema'
import { EventOccurrenceOrderByWithRelationInputSchema } from '../inputTypeSchemas/EventOccurrenceOrderByWithRelationInputSchema'
import { EventOccurrenceWhereUniqueInputSchema } from '../inputTypeSchemas/EventOccurrenceWhereUniqueInputSchema'

export const EventOccurrenceAggregateArgsSchema: z.ZodType<Prisma.EventOccurrenceAggregateArgs> = z.object({
  where: EventOccurrenceWhereInputSchema.optional(), 
  orderBy: z.union([ EventOccurrenceOrderByWithRelationInputSchema.array(), EventOccurrenceOrderByWithRelationInputSchema ]).optional(),
  cursor: EventOccurrenceWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default EventOccurrenceAggregateArgsSchema;
