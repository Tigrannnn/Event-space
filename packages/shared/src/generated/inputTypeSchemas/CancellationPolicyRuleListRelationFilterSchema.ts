import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CancellationPolicyRuleWhereInputSchema } from './CancellationPolicyRuleWhereInputSchema';

export const CancellationPolicyRuleListRelationFilterSchema: z.ZodType<Prisma.CancellationPolicyRuleListRelationFilter> = z.object({
  every: z.lazy(() => CancellationPolicyRuleWhereInputSchema).optional(),
  some: z.lazy(() => CancellationPolicyRuleWhereInputSchema).optional(),
  none: z.lazy(() => CancellationPolicyRuleWhereInputSchema).optional(),
}).strict();

export default CancellationPolicyRuleListRelationFilterSchema;
