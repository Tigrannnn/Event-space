import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { OutboxEventWhereInputSchema } from '../inputTypeSchemas/OutboxEventWhereInputSchema'
import { OutboxEventOrderByWithAggregationInputSchema } from '../inputTypeSchemas/OutboxEventOrderByWithAggregationInputSchema'
import { OutboxEventScalarFieldEnumSchema } from '../inputTypeSchemas/OutboxEventScalarFieldEnumSchema'
import { OutboxEventScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/OutboxEventScalarWhereWithAggregatesInputSchema'

export const OutboxEventGroupByArgsSchema: z.ZodType<Prisma.OutboxEventGroupByArgs> = z.object({
  where: OutboxEventWhereInputSchema.optional(), 
  orderBy: z.union([ OutboxEventOrderByWithAggregationInputSchema.array(), OutboxEventOrderByWithAggregationInputSchema ]).optional(),
  by: OutboxEventScalarFieldEnumSchema.array(), 
  having: OutboxEventScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default OutboxEventGroupByArgsSchema;
