import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CancellationPolicyRuleEventIdHoursBeforeEventCompoundUniqueInputSchema } from './CancellationPolicyRuleEventIdHoursBeforeEventCompoundUniqueInputSchema';
import { CancellationPolicyRuleWhereInputSchema } from './CancellationPolicyRuleWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { EventScalarRelationFilterSchema } from './EventScalarRelationFilterSchema';
import { EventWhereInputSchema } from './EventWhereInputSchema';

export const CancellationPolicyRuleWhereUniqueInputSchema: z.ZodType<Prisma.CancellationPolicyRuleWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    eventId_hoursBeforeEvent: z.lazy(() => CancellationPolicyRuleEventIdHoursBeforeEventCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    eventId_hoursBeforeEvent: z.lazy(() => CancellationPolicyRuleEventIdHoursBeforeEventCompoundUniqueInputSchema),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  eventId_hoursBeforeEvent: z.lazy(() => CancellationPolicyRuleEventIdHoursBeforeEventCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => CancellationPolicyRuleWhereInputSchema), z.lazy(() => CancellationPolicyRuleWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CancellationPolicyRuleWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CancellationPolicyRuleWhereInputSchema), z.lazy(() => CancellationPolicyRuleWhereInputSchema).array() ]).optional(),
  eventId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  hoursBeforeEvent: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  refundPercentage: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  event: z.union([ z.lazy(() => EventScalarRelationFilterSchema), z.lazy(() => EventWhereInputSchema) ]).optional(),
}));

export default CancellationPolicyRuleWhereUniqueInputSchema;
