import { z } from 'zod';

export const CancellationPolicyRuleScalarFieldEnumSchema = z.enum(['id','eventId','hoursBeforeEvent','refundPercentage']);

export default CancellationPolicyRuleScalarFieldEnumSchema;
