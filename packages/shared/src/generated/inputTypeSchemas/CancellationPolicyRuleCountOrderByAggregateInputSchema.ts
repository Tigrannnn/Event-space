import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const CancellationPolicyRuleCountOrderByAggregateInputSchema: z.ZodType<Prisma.CancellationPolicyRuleCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  eventId: z.lazy(() => SortOrderSchema).optional(),
  hoursBeforeEvent: z.lazy(() => SortOrderSchema).optional(),
  refundPercentage: z.lazy(() => SortOrderSchema).optional(),
});

export default CancellationPolicyRuleCountOrderByAggregateInputSchema;
