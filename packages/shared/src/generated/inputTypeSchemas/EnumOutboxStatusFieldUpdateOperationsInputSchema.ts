import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { OutboxStatusSchema } from './OutboxStatusSchema';

export const EnumOutboxStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumOutboxStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => OutboxStatusSchema).optional(),
}).strict();

export default EnumOutboxStatusFieldUpdateOperationsInputSchema;
