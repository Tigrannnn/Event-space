import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdjustmentTypeSchema } from './AdjustmentTypeSchema';

export const EnumAdjustmentTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumAdjustmentTypeFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => AdjustmentTypeSchema).optional(),
}).strict();

export default EnumAdjustmentTypeFieldUpdateOperationsInputSchema;
