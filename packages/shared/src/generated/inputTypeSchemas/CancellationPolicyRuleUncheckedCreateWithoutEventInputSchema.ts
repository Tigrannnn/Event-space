import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CancellationPolicyRuleUncheckedCreateWithoutEventInputSchema: z.ZodType<Prisma.CancellationPolicyRuleUncheckedCreateWithoutEventInput> = z.strictObject({
  id: z.uuid().optional(),
  hoursBeforeEvent: z.number().int(),
  refundPercentage: z.number().int(),
});

export default CancellationPolicyRuleUncheckedCreateWithoutEventInputSchema;
