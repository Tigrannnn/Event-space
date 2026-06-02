import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CancellationPolicyRuleCreateManyInputSchema } from '../inputTypeSchemas/CancellationPolicyRuleCreateManyInputSchema'

export const CancellationPolicyRuleCreateManyArgsSchema: z.ZodType<Prisma.CancellationPolicyRuleCreateManyArgs> = z.object({
  data: z.union([ CancellationPolicyRuleCreateManyInputSchema, CancellationPolicyRuleCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default CancellationPolicyRuleCreateManyArgsSchema;
