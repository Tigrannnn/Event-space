import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CancellationPolicyRuleUpdateManyMutationInputSchema } from '../inputTypeSchemas/CancellationPolicyRuleUpdateManyMutationInputSchema'
import { CancellationPolicyRuleUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/CancellationPolicyRuleUncheckedUpdateManyInputSchema'
import { CancellationPolicyRuleWhereInputSchema } from '../inputTypeSchemas/CancellationPolicyRuleWhereInputSchema'

export const CancellationPolicyRuleUpdateManyArgsSchema: z.ZodType<Prisma.CancellationPolicyRuleUpdateManyArgs> = z.object({
  data: z.union([ CancellationPolicyRuleUpdateManyMutationInputSchema, CancellationPolicyRuleUncheckedUpdateManyInputSchema ]),
  where: CancellationPolicyRuleWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default CancellationPolicyRuleUpdateManyArgsSchema;
