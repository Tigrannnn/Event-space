import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const CancellationPolicyRuleAvgOrderByAggregateInputSchema: z.ZodType<Prisma.CancellationPolicyRuleAvgOrderByAggregateInput> = z.object({
  hoursBeforeEvent: z.lazy(() => SortOrderSchema).optional(),
  refundPercentage: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default CancellationPolicyRuleAvgOrderByAggregateInputSchema;
