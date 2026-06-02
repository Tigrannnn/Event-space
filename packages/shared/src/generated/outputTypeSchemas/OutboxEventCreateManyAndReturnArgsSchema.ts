import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { OutboxEventCreateManyInputSchema } from '../inputTypeSchemas/OutboxEventCreateManyInputSchema'

export const OutboxEventCreateManyAndReturnArgsSchema: z.ZodType<Prisma.OutboxEventCreateManyAndReturnArgs> = z.object({
  data: z.union([ OutboxEventCreateManyInputSchema, OutboxEventCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default OutboxEventCreateManyAndReturnArgsSchema;
