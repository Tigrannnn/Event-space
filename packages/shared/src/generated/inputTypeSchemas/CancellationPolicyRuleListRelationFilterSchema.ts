import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CancellationPolicyRuleWhereInputSchema } from './CancellationPolicyRuleWhereInputSchema';

export const CancellationPolicyRuleListRelationFilterSchema: z.ZodType<Prisma.CancellationPolicyRuleListRelationFilter> = z.strictObject({
  every: z.lazy(() => CancellationPolicyRuleWhereInputSchema).optional(),
  some: z.lazy(() => CancellationPolicyRuleWhereInputSchema).optional(),
  none: z.lazy(() => CancellationPolicyRuleWhereInputSchema).optional(),
});

export default CancellationPolicyRuleListRelationFilterSchema;
