import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';

export const CancellationPolicyRuleScalarWhereInputSchema: z.ZodType<Prisma.CancellationPolicyRuleScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CancellationPolicyRuleScalarWhereInputSchema), z.lazy(() => CancellationPolicyRuleScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CancellationPolicyRuleScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CancellationPolicyRuleScalarWhereInputSchema), z.lazy(() => CancellationPolicyRuleScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  eventId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  hoursBeforeEvent: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  refundPercentage: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
});

export default CancellationPolicyRuleScalarWhereInputSchema;
