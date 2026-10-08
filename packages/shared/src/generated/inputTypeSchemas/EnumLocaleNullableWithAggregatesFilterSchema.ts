import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';
import { NestedEnumLocaleNullableWithAggregatesFilterSchema } from './NestedEnumLocaleNullableWithAggregatesFilterSchema';
import { NestedIntNullableFilterSchema } from './NestedIntNullableFilterSchema';
import { NestedEnumLocaleNullableFilterSchema } from './NestedEnumLocaleNullableFilterSchema';

export const EnumLocaleNullableWithAggregatesFilterSchema: z.ZodType<Prisma.EnumLocaleNullableWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => LocaleSchema).optional().nullable(),
  in: z.lazy(() => LocaleSchema).array().optional().nullable(),
  notIn: z.lazy(() => LocaleSchema).array().optional().nullable(),
  not: z.union([ z.lazy(() => LocaleSchema), z.lazy(() => NestedEnumLocaleNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumLocaleNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumLocaleNullableFilterSchema).optional(),
});

export default EnumLocaleNullableWithAggregatesFilterSchema;
