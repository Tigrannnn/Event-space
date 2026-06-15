import z from 'zod';
import { CancellationPolicyRuleSchema as GeneratedRuleSchema } from '../generated';

export const CancellationPolicyRuleInputSchema = GeneratedRuleSchema.omit({
	id: true,
	eventId: true,
});

export const CancellationPolicyRuleSchema = GeneratedRuleSchema;
export type CancellationPolicyRule = z.infer<typeof CancellationPolicyRuleSchema>;
