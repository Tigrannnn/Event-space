import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { OutboxEventWhereUniqueInputSchema } from '../inputTypeSchemas/OutboxEventWhereUniqueInputSchema'
import { OutboxEventCreateInputSchema } from '../inputTypeSchemas/OutboxEventCreateInputSchema'
import { OutboxEventUncheckedCreateInputSchema } from '../inputTypeSchemas/OutboxEventUncheckedCreateInputSchema'
import { OutboxEventUpdateInputSchema } from '../inputTypeSchemas/OutboxEventUpdateInputSchema'
import { OutboxEventUncheckedUpdateInputSchema } from '../inputTypeSchemas/OutboxEventUncheckedUpdateInputSchema'
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

export const OutboxEventUpsertArgsSchema: z.ZodType<Prisma.OutboxEventUpsertArgs> = z.object({
  select: OutboxEventSelectSchema.optional(),
  where: OutboxEventWhereUniqueInputSchema, 
  create: z.union([ OutboxEventCreateInputSchema, OutboxEventUncheckedCreateInputSchema ]),
  update: z.union([ OutboxEventUpdateInputSchema, OutboxEventUncheckedUpdateInputSchema ]),
}).strict();

export default OutboxEventUpsertArgsSchema;
