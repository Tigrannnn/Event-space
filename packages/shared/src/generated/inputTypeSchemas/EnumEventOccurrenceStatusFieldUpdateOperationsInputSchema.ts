import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceStatusSchema } from './EventOccurrenceStatusSchema';

export const EnumEventOccurrenceStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumEventOccurrenceStatusFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => EventOccurrenceStatusSchema).optional(),
});

export default EnumEventOccurrenceStatusFieldUpdateOperationsInputSchema;
