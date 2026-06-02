import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CancellationPolicyRuleCreateManyInputSchema: z.ZodType<Prisma.CancellationPolicyRuleCreateManyInput> = z.object({
  id: z.uuid().optional(),
  eventId: z.string(),
  hoursBeforeEvent: z.number().int(),
  refundPercentage: z.number().int(),
}).strict();

export default CancellationPolicyRuleCreateManyInputSchema;
