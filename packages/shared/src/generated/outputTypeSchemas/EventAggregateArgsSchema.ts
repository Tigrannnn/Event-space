import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventWhereInputSchema } from '../inputTypeSchemas/EventWhereInputSchema'
import { EventOrderByWithRelationInputSchema } from '../inputTypeSchemas/EventOrderByWithRelationInputSchema'
import { EventWhereUniqueInputSchema } from '../inputTypeSchemas/EventWhereUniqueInputSchema'

export const EventAggregateArgsSchema: z.ZodType<Prisma.EventAggregateArgs> = z.object({
  where: EventWhereInputSchema.optional(), 
  orderBy: z.union([ EventOrderByWithRelationInputSchema.array(), EventOrderByWithRelationInputSchema ]).optional(),
  cursor: EventWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default EventAggregateArgsSchema;
