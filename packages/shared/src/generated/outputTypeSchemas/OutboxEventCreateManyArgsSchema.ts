import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { OutboxEventCreateManyInputSchema } from '../inputTypeSchemas/OutboxEventCreateManyInputSchema'

export const OutboxEventCreateManyArgsSchema: z.ZodType<Prisma.OutboxEventCreateManyArgs> = z.object({
  data: z.union([ OutboxEventCreateManyInputSchema, OutboxEventCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default OutboxEventCreateManyArgsSchema;
