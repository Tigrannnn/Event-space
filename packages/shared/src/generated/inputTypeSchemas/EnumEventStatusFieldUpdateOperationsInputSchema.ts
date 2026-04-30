import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventStatusSchema } from './EventStatusSchema';

export const EnumEventStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumEventStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => EventStatusSchema).optional(),
}).strict();

export default EnumEventStatusFieldUpdateOperationsInputSchema;
