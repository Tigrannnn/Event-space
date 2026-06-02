import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { OutboxEventWhereInputSchema } from '../inputTypeSchemas/OutboxEventWhereInputSchema'
import { OutboxEventOrderByWithRelationInputSchema } from '../inputTypeSchemas/OutboxEventOrderByWithRelationInputSchema'
import { OutboxEventWhereUniqueInputSchema } from '../inputTypeSchemas/OutboxEventWhereUniqueInputSchema'
import { OutboxEventScalarFieldEnumSchema } from '../inputTypeSchemas/OutboxEventScalarFieldEnumSchema'
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const OutboxEventSelectSchema: z.ZodType<Prisma.OutboxEventSelect> = z.object({
  id: z.boolean().optional(),
  action: z.boolean().optional(),
  payload: z.boolean().optional(),
  status: z.boolean().optional(),
  attempts: z.boolean().optional(),
  lastError: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  processedAt: z.boolean().optional(),
}).strict()

export const OutboxEventFindManyArgsSchema: z.ZodType<Prisma.OutboxEventFindManyArgs> = z.object({
  select: OutboxEventSelectSchema.optional(),
  where: OutboxEventWhereInputSchema.optional(), 
  orderBy: z.union([ OutboxEventOrderByWithRelationInputSchema.array(), OutboxEventOrderByWithRelationInputSchema ]).optional(),
  cursor: OutboxEventWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OutboxEventScalarFieldEnumSchema, OutboxEventScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export default OutboxEventFindManyArgsSchema;
