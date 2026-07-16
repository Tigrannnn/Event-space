import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { EventScalarRelationFilterSchema } from './EventScalarRelationFilterSchema';
import { EventWhereInputSchema } from './EventWhereInputSchema';

export const CancellationPolicyRuleWhereInputSchema: z.ZodType<Prisma.CancellationPolicyRuleWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CancellationPolicyRuleWhereInputSchema), z.lazy(() => CancellationPolicyRuleWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CancellationPolicyRuleWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CancellationPolicyRuleWhereInputSchema), z.lazy(() => CancellationPolicyRuleWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  eventId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  hoursBeforeEvent: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  refundPercentage: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  event: z.union([ z.lazy(() => EventScalarRelationFilterSchema), z.lazy(() => EventWhereInputSchema) ]).optional(),
});

export default CancellationPolicyRuleWhereInputSchema;
