import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CancellationPolicyRuleWhereUniqueInputSchema } from './CancellationPolicyRuleWhereUniqueInputSchema';
import { CancellationPolicyRuleUpdateWithoutEventInputSchema } from './CancellationPolicyRuleUpdateWithoutEventInputSchema';
import { CancellationPolicyRuleUncheckedUpdateWithoutEventInputSchema } from './CancellationPolicyRuleUncheckedUpdateWithoutEventInputSchema';

export const CancellationPolicyRuleUpdateWithWhereUniqueWithoutEventInputSchema: z.ZodType<Prisma.CancellationPolicyRuleUpdateWithWhereUniqueWithoutEventInput> = z.strictObject({
  where: z.lazy(() => CancellationPolicyRuleWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CancellationPolicyRuleUpdateWithoutEventInputSchema), z.lazy(() => CancellationPolicyRuleUncheckedUpdateWithoutEventInputSchema) ]),
});

export default CancellationPolicyRuleUpdateWithWhereUniqueWithoutEventInputSchema;
