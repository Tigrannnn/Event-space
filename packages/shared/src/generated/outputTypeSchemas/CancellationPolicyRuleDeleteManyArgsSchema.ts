import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CancellationPolicyRuleWhereInputSchema } from '../inputTypeSchemas/CancellationPolicyRuleWhereInputSchema'

export const CancellationPolicyRuleDeleteManyArgsSchema: z.ZodType<Prisma.CancellationPolicyRuleDeleteManyArgs> = z.object({
  where: CancellationPolicyRuleWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default CancellationPolicyRuleDeleteManyArgsSchema;
