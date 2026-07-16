import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';

export const EnumLocaleFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumLocaleFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => LocaleSchema).optional(),
});

export default EnumLocaleFieldUpdateOperationsInputSchema;
