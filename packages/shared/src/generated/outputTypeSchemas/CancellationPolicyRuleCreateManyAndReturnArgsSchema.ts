import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CancellationPolicyRuleCreateManyInputSchema } from '../inputTypeSchemas/CancellationPolicyRuleCreateManyInputSchema'

export const CancellationPolicyRuleCreateManyAndReturnArgsSchema: z.ZodType<Prisma.CancellationPolicyRuleCreateManyAndReturnArgs> = z.object({
  data: z.union([ CancellationPolicyRuleCreateManyInputSchema, CancellationPolicyRuleCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default CancellationPolicyRuleCreateManyAndReturnArgsSchema;
