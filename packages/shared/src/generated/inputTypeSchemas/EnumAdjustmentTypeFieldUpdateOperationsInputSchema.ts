import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdjustmentTypeSchema } from './AdjustmentTypeSchema';

export const EnumAdjustmentTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumAdjustmentTypeFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => AdjustmentTypeSchema).optional(),
});

export default EnumAdjustmentTypeFieldUpdateOperationsInputSchema;
