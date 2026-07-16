import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CancellationPolicyRuleEventIdHoursBeforeEventCompoundUniqueInputSchema: z.ZodType<Prisma.CancellationPolicyRuleEventIdHoursBeforeEventCompoundUniqueInput> = z.strictObject({
  eventId: z.string(),
  hoursBeforeEvent: z.number(),
});

export default CancellationPolicyRuleEventIdHoursBeforeEventCompoundUniqueInputSchema;
