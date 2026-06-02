import { z } from 'zod';
import type { Prisma } from '@prisma/client';

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

export default OutboxEventSelectSchema;
