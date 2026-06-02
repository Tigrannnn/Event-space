import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { OutboxEventUpdateManyMutationInputSchema } from '../inputTypeSchemas/OutboxEventUpdateManyMutationInputSchema'
import { OutboxEventUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/OutboxEventUncheckedUpdateManyInputSchema'
import { OutboxEventWhereInputSchema } from '../inputTypeSchemas/OutboxEventWhereInputSchema'

export const OutboxEventUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.OutboxEventUpdateManyAndReturnArgs> = z.object({
  data: z.union([ OutboxEventUpdateManyMutationInputSchema, OutboxEventUncheckedUpdateManyInputSchema ]),
  where: OutboxEventWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default OutboxEventUpdateManyAndReturnArgsSchema;
