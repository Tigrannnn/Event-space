import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';
import { NestedEnumLocaleWithAggregatesFilterSchema } from './NestedEnumLocaleWithAggregatesFilterSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumLocaleFilterSchema } from './NestedEnumLocaleFilterSchema';

export const EnumLocaleWithAggregatesFilterSchema: z.ZodType<Prisma.EnumLocaleWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => LocaleSchema).optional(),
  in: z.lazy(() => LocaleSchema).array().optional(),
  notIn: z.lazy(() => LocaleSchema).array().optional(),
  not: z.union([ z.lazy(() => LocaleSchema), z.lazy(() => NestedEnumLocaleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumLocaleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumLocaleFilterSchema).optional(),
});

export default EnumLocaleWithAggregatesFilterSchema;
