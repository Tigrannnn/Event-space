import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventArgsSchema } from "../outputTypeSchemas/EventArgsSchema"

export const CancellationPolicyRuleIncludeSchema: z.ZodType<Prisma.CancellationPolicyRuleInclude> = z.object({
  event: z.union([z.boolean(),z.lazy(() => EventArgsSchema)]).optional(),
}).strict();

export default CancellationPolicyRuleIncludeSchema;
