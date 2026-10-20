import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModificationStatusSchema } from './ModificationStatusSchema';

export const EnumModificationStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumModificationStatusFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => ModificationStatusSchema).optional(),
});

export default EnumModificationStatusFieldUpdateOperationsInputSchema;
