import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const CancellationPolicyRuleSumOrderByAggregateInputSchema: z.ZodType<Prisma.CancellationPolicyRuleSumOrderByAggregateInput> = z.strictObject({
  hoursBeforeEvent: z.lazy(() => SortOrderSchema).optional(),
  refundPercentage: z.lazy(() => SortOrderSchema).optional(),
});

export default CancellationPolicyRuleSumOrderByAggregateInputSchema;
