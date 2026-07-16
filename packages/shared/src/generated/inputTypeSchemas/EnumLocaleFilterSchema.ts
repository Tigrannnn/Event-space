import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';
import { NestedEnumLocaleFilterSchema } from './NestedEnumLocaleFilterSchema';

export const EnumLocaleFilterSchema: z.ZodType<Prisma.EnumLocaleFilter> = z.strictObject({
  equals: z.lazy(() => LocaleSchema).optional(),
  in: z.lazy(() => LocaleSchema).array().optional(),
  notIn: z.lazy(() => LocaleSchema).array().optional(),
  not: z.union([ z.lazy(() => LocaleSchema), z.lazy(() => NestedEnumLocaleFilterSchema) ]).optional(),
});

export default EnumLocaleFilterSchema;
