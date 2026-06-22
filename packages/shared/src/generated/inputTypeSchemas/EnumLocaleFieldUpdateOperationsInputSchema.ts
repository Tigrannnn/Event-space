import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';

export const EnumLocaleFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumLocaleFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => LocaleSchema).optional(),
}).strict();

export default EnumLocaleFieldUpdateOperationsInputSchema;
