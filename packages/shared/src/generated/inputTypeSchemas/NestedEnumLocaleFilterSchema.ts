import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';

export const NestedEnumLocaleFilterSchema: z.ZodType<Prisma.NestedEnumLocaleFilter> = z.object({
  equals: z.lazy(() => LocaleSchema).optional(),
  in: z.lazy(() => LocaleSchema).array().optional(),
  notIn: z.lazy(() => LocaleSchema).array().optional(),
  not: z.union([ z.lazy(() => LocaleSchema), z.lazy(() => NestedEnumLocaleFilterSchema) ]).optional(),
}).strict();

export default NestedEnumLocaleFilterSchema;
