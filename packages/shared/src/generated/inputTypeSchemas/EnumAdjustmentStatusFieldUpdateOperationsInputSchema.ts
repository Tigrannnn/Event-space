import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdjustmentStatusSchema } from './AdjustmentStatusSchema';

export const EnumAdjustmentStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumAdjustmentStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => AdjustmentStatusSchema).optional(),
}).strict();

export default EnumAdjustmentStatusFieldUpdateOperationsInputSchema;
