import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';
import { NestedEnumLocaleNullableFilterSchema } from './NestedEnumLocaleNullableFilterSchema';

export const EnumLocaleNullableFilterSchema: z.ZodType<Prisma.EnumLocaleNullableFilter> = z.strictObject({
  equals: z.lazy(() => LocaleSchema).optional().nullable(),
  in: z.lazy(() => LocaleSchema).array().optional().nullable(),
  notIn: z.lazy(() => LocaleSchema).array().optional().nullable(),
  not: z.union([ z.lazy(() => LocaleSchema), z.lazy(() => NestedEnumLocaleNullableFilterSchema) ]).optional().nullable(),
});

export default EnumLocaleNullableFilterSchema;
