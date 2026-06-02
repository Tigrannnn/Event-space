import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { OutboxEventWhereInputSchema } from '../inputTypeSchemas/OutboxEventWhereInputSchema'

export const OutboxEventDeleteManyArgsSchema: z.ZodType<Prisma.OutboxEventDeleteManyArgs> = z.object({
  where: OutboxEventWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default OutboxEventDeleteManyArgsSchema;
