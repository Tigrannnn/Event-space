import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CancellationPolicyRuleSelectSchema } from '../inputTypeSchemas/CancellationPolicyRuleSelectSchema';
import { CancellationPolicyRuleIncludeSchema } from '../inputTypeSchemas/CancellationPolicyRuleIncludeSchema';

export const CancellationPolicyRuleArgsSchema: z.ZodType<Prisma.CancellationPolicyRuleDefaultArgs> = z.object({
  select: z.lazy(() => CancellationPolicyRuleSelectSchema).optional(),
  include: z.lazy(() => CancellationPolicyRuleIncludeSchema).optional(),
}).strict();

export default CancellationPolicyRuleArgsSchema;
