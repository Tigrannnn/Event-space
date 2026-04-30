import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventStatusSchema } from './EventStatusSchema';
import { NestedEnumEventStatusFilterSchema } from './NestedEnumEventStatusFilterSchema';

export const EnumEventStatusFilterSchema: z.ZodType<Prisma.EnumEventStatusFilter> = z.object({
  equals: z.lazy(() => EventStatusSchema).optional(),
  in: z.lazy(() => EventStatusSchema).array().optional(),
  notIn: z.lazy(() => EventStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => EventStatusSchema), z.lazy(() => NestedEnumEventStatusFilterSchema) ]).optional(),
}).strict();

export default EnumEventStatusFilterSchema;
