import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { LocaleSchema } from './LocaleSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumLocaleFilterSchema } from './NestedEnumLocaleFilterSchema';

export const NestedEnumLocaleWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumLocaleWithAggregatesFilter> = z.object({
  equals: z.lazy(() => LocaleSchema).optional(),
  in: z.lazy(() => LocaleSchema).array().optional(),
  notIn: z.lazy(() => LocaleSchema).array().optional(),
  not: z.union([ z.lazy(() => LocaleSchema), z.lazy(() => NestedEnumLocaleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumLocaleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumLocaleFilterSchema).optional(),
}).strict();

export default NestedEnumLocaleWithAggregatesFilterSchema;
