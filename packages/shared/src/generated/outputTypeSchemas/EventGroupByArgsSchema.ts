import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventWhereInputSchema } from '../inputTypeSchemas/EventWhereInputSchema'
import { EventOrderByWithAggregationInputSchema } from '../inputTypeSchemas/EventOrderByWithAggregationInputSchema'
import { EventScalarFieldEnumSchema } from '../inputTypeSchemas/EventScalarFieldEnumSchema'
import { EventScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/EventScalarWhereWithAggregatesInputSchema'

export const EventGroupByArgsSchema: z.ZodType<Prisma.EventGroupByArgs> = z.object({
  where: EventWhereInputSchema.optional(), 
  orderBy: z.union([ EventOrderByWithAggregationInputSchema.array(), EventOrderByWithAggregationInputSchema ]).optional(),
  by: EventScalarFieldEnumSchema.array(), 
  having: EventScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default EventGroupByArgsSchema;
