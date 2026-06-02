import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { OutboxEventWhereInputSchema } from '../inputTypeSchemas/OutboxEventWhereInputSchema'
import { OutboxEventOrderByWithRelationInputSchema } from '../inputTypeSchemas/OutboxEventOrderByWithRelationInputSchema'
import { OutboxEventWhereUniqueInputSchema } from '../inputTypeSchemas/OutboxEventWhereUniqueInputSchema'

export const OutboxEventAggregateArgsSchema: z.ZodType<Prisma.OutboxEventAggregateArgs> = z.object({
  where: OutboxEventWhereInputSchema.optional(), 
  orderBy: z.union([ OutboxEventOrderByWithRelationInputSchema.array(), OutboxEventOrderByWithRelationInputSchema ]).optional(),
  cursor: OutboxEventWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default OutboxEventAggregateArgsSchema;
