import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const CancellationPolicyRuleAvgOrderByAggregateInputSchema: z.ZodType<Prisma.CancellationPolicyRuleAvgOrderByAggregateInput> = z.strictObject({
  hoursBeforeEvent: z.lazy(() => SortOrderSchema).optional(),
  refundPercentage: z.lazy(() => SortOrderSchema).optional(),
});

export default CancellationPolicyRuleAvgOrderByAggregateInputSchema;
