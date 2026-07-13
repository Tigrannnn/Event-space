import { z } from 'zod';

/////////////////////////////////////////
// CANCELLATION POLICY RULE SCHEMA
/////////////////////////////////////////

export const CancellationPolicyRuleSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string(),
  hoursBeforeEvent: z.number().int(),
  refundPercentage: z.number().int(),
})

export type CancellationPolicyRule = z.infer<typeof CancellationPolicyRuleSchema>

export default CancellationPolicyRuleSchema;
