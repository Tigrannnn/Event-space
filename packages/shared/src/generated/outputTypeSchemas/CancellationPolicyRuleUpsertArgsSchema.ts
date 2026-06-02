import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CancellationPolicyRuleIncludeSchema } from '../inputTypeSchemas/CancellationPolicyRuleIncludeSchema'
import { CancellationPolicyRuleWhereUniqueInputSchema } from '../inputTypeSchemas/CancellationPolicyRuleWhereUniqueInputSchema'
import { CancellationPolicyRuleCreateInputSchema } from '../inputTypeSchemas/CancellationPolicyRuleCreateInputSchema'
import { CancellationPolicyRuleUncheckedCreateInputSchema } from '../inputTypeSchemas/CancellationPolicyRuleUncheckedCreateInputSchema'
import { CancellationPolicyRuleUpdateInputSchema } from '../inputTypeSchemas/CancellationPolicyRuleUpdateInputSchema'
import { CancellationPolicyRuleUncheckedUpdateInputSchema } from '../inputTypeSchemas/CancellationPolicyRuleUncheckedUpdateInputSchema'
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

export const CancellationPolicyRuleUpsertArgsSchema: z.ZodType<Prisma.CancellationPolicyRuleUpsertArgs> = z.object({
  select: CancellationPolicyRuleSelectSchema.optional(),
  include: z.lazy(() => CancellationPolicyRuleIncludeSchema).optional(),
  where: CancellationPolicyRuleWhereUniqueInputSchema, 
  create: z.union([ CancellationPolicyRuleCreateInputSchema, CancellationPolicyRuleUncheckedCreateInputSchema ]),
  update: z.union([ CancellationPolicyRuleUpdateInputSchema, CancellationPolicyRuleUncheckedUpdateInputSchema ]),
}).strict();

export default CancellationPolicyRuleUpsertArgsSchema;
