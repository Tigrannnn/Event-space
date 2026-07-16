import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CancellationPolicyRuleUncheckedCreateInputSchema: z.ZodType<Prisma.CancellationPolicyRuleUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  eventId: z.string(),
  hoursBeforeEvent: z.number().int(),
  refundPercentage: z.number().int(),
});

export default CancellationPolicyRuleUncheckedCreateInputSchema;
