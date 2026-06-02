import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { OutboxEventUpdateInputSchema } from '../inputTypeSchemas/OutboxEventUpdateInputSchema'
import { OutboxEventUncheckedUpdateInputSchema } from '../inputTypeSchemas/OutboxEventUncheckedUpdateInputSchema'
import { OutboxEventWhereUniqueInputSchema } from '../inputTypeSchemas/OutboxEventWhereUniqueInputSchema'
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

export const OutboxEventUpdateArgsSchema: z.ZodType<Prisma.OutboxEventUpdateArgs> = z.object({
  select: OutboxEventSelectSchema.optional(),
  data: z.union([ OutboxEventUpdateInputSchema, OutboxEventUncheckedUpdateInputSchema ]),
  where: OutboxEventWhereUniqueInputSchema, 
}).strict();

export default OutboxEventUpdateArgsSchema;
