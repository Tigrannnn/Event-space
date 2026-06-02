import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CancellationPolicyRuleCreateManyEventInputSchema } from './CancellationPolicyRuleCreateManyEventInputSchema';

export const CancellationPolicyRuleCreateManyEventInputEnvelopeSchema: z.ZodType<Prisma.CancellationPolicyRuleCreateManyEventInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => CancellationPolicyRuleCreateManyEventInputSchema), z.lazy(() => CancellationPolicyRuleCreateManyEventInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default CancellationPolicyRuleCreateManyEventInputEnvelopeSchema;
