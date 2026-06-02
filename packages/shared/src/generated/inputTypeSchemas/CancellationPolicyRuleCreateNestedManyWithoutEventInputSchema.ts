import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CancellationPolicyRuleCreateWithoutEventInputSchema } from './CancellationPolicyRuleCreateWithoutEventInputSchema';
import { CancellationPolicyRuleUncheckedCreateWithoutEventInputSchema } from './CancellationPolicyRuleUncheckedCreateWithoutEventInputSchema';
import { CancellationPolicyRuleCreateOrConnectWithoutEventInputSchema } from './CancellationPolicyRuleCreateOrConnectWithoutEventInputSchema';
import { CancellationPolicyRuleCreateManyEventInputEnvelopeSchema } from './CancellationPolicyRuleCreateManyEventInputEnvelopeSchema';
import { CancellationPolicyRuleWhereUniqueInputSchema } from './CancellationPolicyRuleWhereUniqueInputSchema';

export const CancellationPolicyRuleCreateNestedManyWithoutEventInputSchema: z.ZodType<Prisma.CancellationPolicyRuleCreateNestedManyWithoutEventInput> = z.object({
  create: z.union([ z.lazy(() => CancellationPolicyRuleCreateWithoutEventInputSchema), z.lazy(() => CancellationPolicyRuleCreateWithoutEventInputSchema).array(), z.lazy(() => CancellationPolicyRuleUncheckedCreateWithoutEventInputSchema), z.lazy(() => CancellationPolicyRuleUncheckedCreateWithoutEventInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CancellationPolicyRuleCreateOrConnectWithoutEventInputSchema), z.lazy(() => CancellationPolicyRuleCreateOrConnectWithoutEventInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CancellationPolicyRuleCreateManyEventInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CancellationPolicyRuleWhereUniqueInputSchema), z.lazy(() => CancellationPolicyRuleWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default CancellationPolicyRuleCreateNestedManyWithoutEventInputSchema;
