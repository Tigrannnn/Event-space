import { z } from 'zod';

export const CancellationPolicyRuleSchema = z.object({
	hoursBeforeEvent: z.number().int().nonnegative(),
	refundPercentage: z.number().min(0).max(100),
});

export type CancellationPolicyRule = z.infer<typeof CancellationPolicyRuleSchema>;

export const CancellationPolicySchema = z.object({
	enabled: z.boolean(),
	rules: z.array(CancellationPolicyRuleSchema).min(1),
});

export type CancellationPolicy = z.infer<typeof CancellationPolicySchema>;
