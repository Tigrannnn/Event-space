import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventImageWhereInputSchema } from '../inputTypeSchemas/EventImageWhereInputSchema'
import { EventImageOrderByWithAggregationInputSchema } from '../inputTypeSchemas/EventImageOrderByWithAggregationInputSchema'
import { EventImageScalarFieldEnumSchema } from '../inputTypeSchemas/EventImageScalarFieldEnumSchema'
import { EventImageScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/EventImageScalarWhereWithAggregatesInputSchema'

export const EventImageGroupByArgsSchema: z.ZodType<Prisma.EventImageGroupByArgs> = z.object({
  where: EventImageWhereInputSchema.optional(), 
  orderBy: z.union([ EventImageOrderByWithAggregationInputSchema.array(), EventImageOrderByWithAggregationInputSchema ]).optional(),
  by: EventImageScalarFieldEnumSchema.array(), 
  having: EventImageScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default EventImageGroupByArgsSchema;
