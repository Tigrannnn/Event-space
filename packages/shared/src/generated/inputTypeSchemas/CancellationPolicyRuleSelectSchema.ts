import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventArgsSchema } from "../outputTypeSchemas/EventArgsSchema"

export const CancellationPolicyRuleSelectSchema: z.ZodType<Prisma.CancellationPolicyRuleSelect> = z.object({
  id: z.boolean().optional(),
  eventId: z.boolean().optional(),
  hoursBeforeEvent: z.boolean().optional(),
  refundPercentage: z.boolean().optional(),
  event: z.union([z.boolean(),z.lazy(() => EventArgsSchema)]).optional(),
}).strict()

export default CancellationPolicyRuleSelectSchema;
