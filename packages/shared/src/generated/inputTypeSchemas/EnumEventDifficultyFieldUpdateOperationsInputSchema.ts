import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventDifficultySchema } from './EventDifficultySchema';

export const EnumEventDifficultyFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumEventDifficultyFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => EventDifficultySchema).optional(),
});

export default EnumEventDifficultyFieldUpdateOperationsInputSchema;
