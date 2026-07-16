import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdjustmentStatusSchema } from './AdjustmentStatusSchema';

export const EnumAdjustmentStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumAdjustmentStatusFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => AdjustmentStatusSchema).optional(),
});

export default EnumAdjustmentStatusFieldUpdateOperationsInputSchema;
