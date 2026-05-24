import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventImageWhereInputSchema } from '../inputTypeSchemas/EventImageWhereInputSchema'
import { EventImageOrderByWithRelationInputSchema } from '../inputTypeSchemas/EventImageOrderByWithRelationInputSchema'
import { EventImageWhereUniqueInputSchema } from '../inputTypeSchemas/EventImageWhereUniqueInputSchema'

export const EventImageAggregateArgsSchema: z.ZodType<Prisma.EventImageAggregateArgs> = z.object({
  where: EventImageWhereInputSchema.optional(), 
  orderBy: z.union([ EventImageOrderByWithRelationInputSchema.array(), EventImageOrderByWithRelationInputSchema ]).optional(),
  cursor: EventImageWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default EventImageAggregateArgsSchema;
