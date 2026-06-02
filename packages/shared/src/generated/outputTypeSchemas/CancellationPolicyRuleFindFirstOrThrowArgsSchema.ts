import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CancellationPolicyRuleIncludeSchema } from '../inputTypeSchemas/CancellationPolicyRuleIncludeSchema'
import { CancellationPolicyRuleWhereInputSchema } from '../inputTypeSchemas/CancellationPolicyRuleWhereInputSchema'
import { CancellationPolicyRuleOrderByWithRelationInputSchema } from '../inputTypeSchemas/CancellationPolicyRuleOrderByWithRelationInputSchema'
import { CancellationPolicyRuleWhereUniqueInputSchema } from '../inputTypeSchemas/CancellationPolicyRuleWhereUniqueInputSchema'
import { CancellationPolicyRuleScalarFieldEnumSchema } from '../inputTypeSchemas/CancellationPolicyRuleScalarFieldEnumSchema'
import { EventArgsSchema } from "../outputTypeSchemas/EventArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const CancellationPolicyRuleSelectSchema: z.ZodType<Prisma.CancellationPolicyRuleSelect> = z.object({
  id: z.boolean().optional(),
  eventId: z.boolean().optional(),
  hoursBeforeEvent: z.boolean().optional(),
  refundPercentage: z.boolean().optional(),
  event: z.union([z.boolean(),z.lazy(() => EventArgsSchema)]).optional(),
}).strict()

export const CancellationPolicyRuleFindFirstOrThrowArgsSchema: z.ZodType<Prisma.CancellationPolicyRuleFindFirstOrThrowArgs> = z.object({
  select: CancellationPolicyRuleSelectSchema.optional(),
  include: z.lazy(() => CancellationPolicyRuleIncludeSchema).optional(),
  where: CancellationPolicyRuleWhereInputSchema.optional(), 
  orderBy: z.union([ CancellationPolicyRuleOrderByWithRelationInputSchema.array(), CancellationPolicyRuleOrderByWithRelationInputSchema ]).optional(),
  cursor: CancellationPolicyRuleWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CancellationPolicyRuleScalarFieldEnumSchema, CancellationPolicyRuleScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export default CancellationPolicyRuleFindFirstOrThrowArgsSchema;
