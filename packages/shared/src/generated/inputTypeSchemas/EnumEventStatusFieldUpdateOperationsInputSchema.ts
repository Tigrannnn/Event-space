import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventStatusSchema } from './EventStatusSchema';

export const EnumEventStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumEventStatusFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => EventStatusSchema).optional(),
});

export default EnumEventStatusFieldUpdateOperationsInputSchema;
