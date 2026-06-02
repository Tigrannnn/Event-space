import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { CancellationPolicyRuleCountOrderByAggregateInputSchema } from './CancellationPolicyRuleCountOrderByAggregateInputSchema';
import { CancellationPolicyRuleAvgOrderByAggregateInputSchema } from './CancellationPolicyRuleAvgOrderByAggregateInputSchema';
import { CancellationPolicyRuleMaxOrderByAggregateInputSchema } from './CancellationPolicyRuleMaxOrderByAggregateInputSchema';
import { CancellationPolicyRuleMinOrderByAggregateInputSchema } from './CancellationPolicyRuleMinOrderByAggregateInputSchema';
import { CancellationPolicyRuleSumOrderByAggregateInputSchema } from './CancellationPolicyRuleSumOrderByAggregateInputSchema';

export const CancellationPolicyRuleOrderByWithAggregationInputSchema: z.ZodType<Prisma.CancellationPolicyRuleOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  eventId: z.lazy(() => SortOrderSchema).optional(),
  hoursBeforeEvent: z.lazy(() => SortOrderSchema).optional(),
  refundPercentage: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => CancellationPolicyRuleCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => CancellationPolicyRuleAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => CancellationPolicyRuleMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => CancellationPolicyRuleMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => CancellationPolicyRuleSumOrderByAggregateInputSchema).optional(),
}).strict();

export default CancellationPolicyRuleOrderByWithAggregationInputSchema;
