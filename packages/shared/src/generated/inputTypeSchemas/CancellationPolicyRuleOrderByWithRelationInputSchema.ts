import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { EventOrderByWithRelationInputSchema } from './EventOrderByWithRelationInputSchema';

export const CancellationPolicyRuleOrderByWithRelationInputSchema: z.ZodType<Prisma.CancellationPolicyRuleOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  eventId: z.lazy(() => SortOrderSchema).optional(),
  hoursBeforeEvent: z.lazy(() => SortOrderSchema).optional(),
  refundPercentage: z.lazy(() => SortOrderSchema).optional(),
  event: z.lazy(() => EventOrderByWithRelationInputSchema).optional(),
});

export default CancellationPolicyRuleOrderByWithRelationInputSchema;
