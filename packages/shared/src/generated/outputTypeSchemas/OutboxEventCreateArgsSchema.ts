import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { OutboxEventCreateInputSchema } from '../inputTypeSchemas/OutboxEventCreateInputSchema'
import { OutboxEventUncheckedCreateInputSchema } from '../inputTypeSchemas/OutboxEventUncheckedCreateInputSchema'
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

export const OutboxEventCreateArgsSchema: z.ZodType<Prisma.OutboxEventCreateArgs> = z.object({
  select: OutboxEventSelectSchema.optional(),
  data: z.union([ OutboxEventCreateInputSchema, OutboxEventUncheckedCreateInputSchema ]),
}).strict();

export default OutboxEventCreateArgsSchema;
