import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateNestedOneWithoutCancellationRulesInputSchema } from './EventCreateNestedOneWithoutCancellationRulesInputSchema';

export const CancellationPolicyRuleCreateInputSchema: z.ZodType<Prisma.CancellationPolicyRuleCreateInput> = z.object({
  id: z.uuid().optional(),
  hoursBeforeEvent: z.number().int(),
  refundPercentage: z.number().int(),
  event: z.lazy(() => EventCreateNestedOneWithoutCancellationRulesInputSchema),
}).strict();

export default CancellationPolicyRuleCreateInputSchema;
