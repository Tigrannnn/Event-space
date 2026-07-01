import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventOccurrenceWhereInputSchema } from '../inputTypeSchemas/EventOccurrenceWhereInputSchema'
import { EventOccurrenceOrderByWithAggregationInputSchema } from '../inputTypeSchemas/EventOccurrenceOrderByWithAggregationInputSchema'
import { EventOccurrenceScalarFieldEnumSchema } from '../inputTypeSchemas/EventOccurrenceScalarFieldEnumSchema'
import { EventOccurrenceScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/EventOccurrenceScalarWhereWithAggregatesInputSchema'

export const EventOccurrenceGroupByArgsSchema: z.ZodType<Prisma.EventOccurrenceGroupByArgs> = z.object({
  where: EventOccurrenceWhereInputSchema.optional(), 
  orderBy: z.union([ EventOccurrenceOrderByWithAggregationInputSchema.array(), EventOccurrenceOrderByWithAggregationInputSchema ]).optional(),
  by: EventOccurrenceScalarFieldEnumSchema.array(), 
  having: EventOccurrenceScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default EventOccurrenceGroupByArgsSchema;
