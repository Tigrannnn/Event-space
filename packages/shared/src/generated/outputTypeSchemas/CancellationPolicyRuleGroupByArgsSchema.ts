import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CancellationPolicyRuleWhereInputSchema } from '../inputTypeSchemas/CancellationPolicyRuleWhereInputSchema'
import { CancellationPolicyRuleOrderByWithAggregationInputSchema } from '../inputTypeSchemas/CancellationPolicyRuleOrderByWithAggregationInputSchema'
import { CancellationPolicyRuleScalarFieldEnumSchema } from '../inputTypeSchemas/CancellationPolicyRuleScalarFieldEnumSchema'
import { CancellationPolicyRuleScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/CancellationPolicyRuleScalarWhereWithAggregatesInputSchema'

export const CancellationPolicyRuleGroupByArgsSchema: z.ZodType<Prisma.CancellationPolicyRuleGroupByArgs> = z.object({
  where: CancellationPolicyRuleWhereInputSchema.optional(), 
  orderBy: z.union([ CancellationPolicyRuleOrderByWithAggregationInputSchema.array(), CancellationPolicyRuleOrderByWithAggregationInputSchema ]).optional(),
  by: CancellationPolicyRuleScalarFieldEnumSchema.array(), 
  having: CancellationPolicyRuleScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default CancellationPolicyRuleGroupByArgsSchema;
