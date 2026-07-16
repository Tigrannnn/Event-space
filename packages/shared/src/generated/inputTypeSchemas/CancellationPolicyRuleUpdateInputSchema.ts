import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { EventUpdateOneRequiredWithoutCancellationRulesNestedInputSchema } from './EventUpdateOneRequiredWithoutCancellationRulesNestedInputSchema';

export const CancellationPolicyRuleUpdateInputSchema: z.ZodType<Prisma.CancellationPolicyRuleUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  hoursBeforeEvent: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  refundPercentage: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  event: z.lazy(() => EventUpdateOneRequiredWithoutCancellationRulesNestedInputSchema).optional(),
});

export default CancellationPolicyRuleUpdateInputSchema;
