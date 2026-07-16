import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CancellationPolicyRuleCreateWithoutEventInputSchema } from './CancellationPolicyRuleCreateWithoutEventInputSchema';
import { CancellationPolicyRuleUncheckedCreateWithoutEventInputSchema } from './CancellationPolicyRuleUncheckedCreateWithoutEventInputSchema';
import { CancellationPolicyRuleCreateOrConnectWithoutEventInputSchema } from './CancellationPolicyRuleCreateOrConnectWithoutEventInputSchema';
import { CancellationPolicyRuleUpsertWithWhereUniqueWithoutEventInputSchema } from './CancellationPolicyRuleUpsertWithWhereUniqueWithoutEventInputSchema';
import { CancellationPolicyRuleCreateManyEventInputEnvelopeSchema } from './CancellationPolicyRuleCreateManyEventInputEnvelopeSchema';
import { CancellationPolicyRuleWhereUniqueInputSchema } from './CancellationPolicyRuleWhereUniqueInputSchema';
import { CancellationPolicyRuleUpdateWithWhereUniqueWithoutEventInputSchema } from './CancellationPolicyRuleUpdateWithWhereUniqueWithoutEventInputSchema';
import { CancellationPolicyRuleUpdateManyWithWhereWithoutEventInputSchema } from './CancellationPolicyRuleUpdateManyWithWhereWithoutEventInputSchema';
import { CancellationPolicyRuleScalarWhereInputSchema } from './CancellationPolicyRuleScalarWhereInputSchema';

export const CancellationPolicyRuleUncheckedUpdateManyWithoutEventNestedInputSchema: z.ZodType<Prisma.CancellationPolicyRuleUncheckedUpdateManyWithoutEventNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CancellationPolicyRuleCreateWithoutEventInputSchema), z.lazy(() => CancellationPolicyRuleCreateWithoutEventInputSchema).array(), z.lazy(() => CancellationPolicyRuleUncheckedCreateWithoutEventInputSchema), z.lazy(() => CancellationPolicyRuleUncheckedCreateWithoutEventInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CancellationPolicyRuleCreateOrConnectWithoutEventInputSchema), z.lazy(() => CancellationPolicyRuleCreateOrConnectWithoutEventInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CancellationPolicyRuleUpsertWithWhereUniqueWithoutEventInputSchema), z.lazy(() => CancellationPolicyRuleUpsertWithWhereUniqueWithoutEventInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CancellationPolicyRuleCreateManyEventInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CancellationPolicyRuleWhereUniqueInputSchema), z.lazy(() => CancellationPolicyRuleWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CancellationPolicyRuleWhereUniqueInputSchema), z.lazy(() => CancellationPolicyRuleWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CancellationPolicyRuleWhereUniqueInputSchema), z.lazy(() => CancellationPolicyRuleWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CancellationPolicyRuleWhereUniqueInputSchema), z.lazy(() => CancellationPolicyRuleWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CancellationPolicyRuleUpdateWithWhereUniqueWithoutEventInputSchema), z.lazy(() => CancellationPolicyRuleUpdateWithWhereUniqueWithoutEventInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CancellationPolicyRuleUpdateManyWithWhereWithoutEventInputSchema), z.lazy(() => CancellationPolicyRuleUpdateManyWithWhereWithoutEventInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CancellationPolicyRuleScalarWhereInputSchema), z.lazy(() => CancellationPolicyRuleScalarWhereInputSchema).array() ]).optional(),
});

export default CancellationPolicyRuleUncheckedUpdateManyWithoutEventNestedInputSchema;
