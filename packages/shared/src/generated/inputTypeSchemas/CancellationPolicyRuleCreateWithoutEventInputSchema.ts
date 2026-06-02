import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CancellationPolicyRuleCreateWithoutEventInputSchema: z.ZodType<Prisma.CancellationPolicyRuleCreateWithoutEventInput> = z.object({
  id: z.uuid().optional(),
  hoursBeforeEvent: z.number().int(),
  refundPercentage: z.number().int(),
}).strict();

export default CancellationPolicyRuleCreateWithoutEventInputSchema;
