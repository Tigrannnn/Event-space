import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CancellationPolicyRuleWhereInputSchema } from '../inputTypeSchemas/CancellationPolicyRuleWhereInputSchema'
import { CancellationPolicyRuleOrderByWithRelationInputSchema } from '../inputTypeSchemas/CancellationPolicyRuleOrderByWithRelationInputSchema'
import { CancellationPolicyRuleWhereUniqueInputSchema } from '../inputTypeSchemas/CancellationPolicyRuleWhereUniqueInputSchema'

export const CancellationPolicyRuleAggregateArgsSchema: z.ZodType<Prisma.CancellationPolicyRuleAggregateArgs> = z.object({
  where: CancellationPolicyRuleWhereInputSchema.optional(), 
  orderBy: z.union([ CancellationPolicyRuleOrderByWithRelationInputSchema.array(), CancellationPolicyRuleOrderByWithRelationInputSchema ]).optional(),
  cursor: CancellationPolicyRuleWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default CancellationPolicyRuleAggregateArgsSchema;
