import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CancellationPolicyRuleCreateManyEventInputSchema: z.ZodType<Prisma.CancellationPolicyRuleCreateManyEventInput> = z.strictObject({
  id: z.uuid().optional(),
  hoursBeforeEvent: z.number().int(),
  refundPercentage: z.number().int(),
});

export default CancellationPolicyRuleCreateManyEventInputSchema;
