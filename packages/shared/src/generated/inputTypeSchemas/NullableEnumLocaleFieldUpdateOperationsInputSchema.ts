import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';

export const NullableEnumLocaleFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableEnumLocaleFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => LocaleSchema).optional().nullable(),
});

export default NullableEnumLocaleFieldUpdateOperationsInputSchema;
