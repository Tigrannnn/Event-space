import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CancellationPolicyRuleWhereUniqueInputSchema } from './CancellationPolicyRuleWhereUniqueInputSchema';
import { CancellationPolicyRuleCreateWithoutEventInputSchema } from './CancellationPolicyRuleCreateWithoutEventInputSchema';
import { CancellationPolicyRuleUncheckedCreateWithoutEventInputSchema } from './CancellationPolicyRuleUncheckedCreateWithoutEventInputSchema';

export const CancellationPolicyRuleCreateOrConnectWithoutEventInputSchema: z.ZodType<Prisma.CancellationPolicyRuleCreateOrConnectWithoutEventInput> = z.object({
  where: z.lazy(() => CancellationPolicyRuleWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CancellationPolicyRuleCreateWithoutEventInputSchema), z.lazy(() => CancellationPolicyRuleUncheckedCreateWithoutEventInputSchema) ]),
}).strict();

export default CancellationPolicyRuleCreateOrConnectWithoutEventInputSchema;
