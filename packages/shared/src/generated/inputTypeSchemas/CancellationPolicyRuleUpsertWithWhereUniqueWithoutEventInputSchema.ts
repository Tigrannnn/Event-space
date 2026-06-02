import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CancellationPolicyRuleWhereUniqueInputSchema } from './CancellationPolicyRuleWhereUniqueInputSchema';
import { CancellationPolicyRuleUpdateWithoutEventInputSchema } from './CancellationPolicyRuleUpdateWithoutEventInputSchema';
import { CancellationPolicyRuleUncheckedUpdateWithoutEventInputSchema } from './CancellationPolicyRuleUncheckedUpdateWithoutEventInputSchema';
import { CancellationPolicyRuleCreateWithoutEventInputSchema } from './CancellationPolicyRuleCreateWithoutEventInputSchema';
import { CancellationPolicyRuleUncheckedCreateWithoutEventInputSchema } from './CancellationPolicyRuleUncheckedCreateWithoutEventInputSchema';

export const CancellationPolicyRuleUpsertWithWhereUniqueWithoutEventInputSchema: z.ZodType<Prisma.CancellationPolicyRuleUpsertWithWhereUniqueWithoutEventInput> = z.object({
  where: z.lazy(() => CancellationPolicyRuleWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CancellationPolicyRuleUpdateWithoutEventInputSchema), z.lazy(() => CancellationPolicyRuleUncheckedUpdateWithoutEventInputSchema) ]),
  create: z.union([ z.lazy(() => CancellationPolicyRuleCreateWithoutEventInputSchema), z.lazy(() => CancellationPolicyRuleUncheckedCreateWithoutEventInputSchema) ]),
}).strict();

export default CancellationPolicyRuleUpsertWithWhereUniqueWithoutEventInputSchema;
