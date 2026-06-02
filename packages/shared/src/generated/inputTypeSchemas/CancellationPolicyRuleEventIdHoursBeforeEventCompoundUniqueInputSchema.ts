import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CancellationPolicyRuleEventIdHoursBeforeEventCompoundUniqueInputSchema: z.ZodType<Prisma.CancellationPolicyRuleEventIdHoursBeforeEventCompoundUniqueInput> = z.object({
  eventId: z.string(),
  hoursBeforeEvent: z.number(),
}).strict();

export default CancellationPolicyRuleEventIdHoursBeforeEventCompoundUniqueInputSchema;
