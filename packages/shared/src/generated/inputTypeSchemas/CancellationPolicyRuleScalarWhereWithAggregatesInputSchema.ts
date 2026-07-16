import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';

export const CancellationPolicyRuleScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CancellationPolicyRuleScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CancellationPolicyRuleScalarWhereWithAggregatesInputSchema), z.lazy(() => CancellationPolicyRuleScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => CancellationPolicyRuleScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CancellationPolicyRuleScalarWhereWithAggregatesInputSchema), z.lazy(() => CancellationPolicyRuleScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  eventId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  hoursBeforeEvent: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  refundPercentage: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
});

export default CancellationPolicyRuleScalarWhereWithAggregatesInputSchema;
