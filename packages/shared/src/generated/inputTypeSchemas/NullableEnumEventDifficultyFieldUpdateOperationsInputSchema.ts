import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventDifficultySchema } from './EventDifficultySchema';

export const NullableEnumEventDifficultyFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableEnumEventDifficultyFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => EventDifficultySchema).optional().nullable(),
}).strict();

export default NullableEnumEventDifficultyFieldUpdateOperationsInputSchema;
