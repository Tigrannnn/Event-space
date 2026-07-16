import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CancellationPolicyRuleCreateWithoutEventInputSchema: z.ZodType<Prisma.CancellationPolicyRuleCreateWithoutEventInput> = z.strictObject({
  id: z.uuid().optional(),
  hoursBeforeEvent: z.number().int(),
  refundPercentage: z.number().int(),
});

export default CancellationPolicyRuleCreateWithoutEventInputSchema;
