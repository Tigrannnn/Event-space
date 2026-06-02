import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CancellationPolicyRuleScalarWhereInputSchema } from './CancellationPolicyRuleScalarWhereInputSchema';
import { CancellationPolicyRuleUpdateManyMutationInputSchema } from './CancellationPolicyRuleUpdateManyMutationInputSchema';
import { CancellationPolicyRuleUncheckedUpdateManyWithoutEventInputSchema } from './CancellationPolicyRuleUncheckedUpdateManyWithoutEventInputSchema';

export const CancellationPolicyRuleUpdateManyWithWhereWithoutEventInputSchema: z.ZodType<Prisma.CancellationPolicyRuleUpdateManyWithWhereWithoutEventInput> = z.object({
  where: z.lazy(() => CancellationPolicyRuleScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CancellationPolicyRuleUpdateManyMutationInputSchema), z.lazy(() => CancellationPolicyRuleUncheckedUpdateManyWithoutEventInputSchema) ]),
}).strict();

export default CancellationPolicyRuleUpdateManyWithWhereWithoutEventInputSchema;
