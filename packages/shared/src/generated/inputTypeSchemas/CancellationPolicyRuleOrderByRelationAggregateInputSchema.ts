import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const CancellationPolicyRuleOrderByRelationAggregateInputSchema: z.ZodType<Prisma.CancellationPolicyRuleOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export default CancellationPolicyRuleOrderByRelationAggregateInputSchema;
