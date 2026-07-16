import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventStatusSchema } from './EventStatusSchema';

export const NestedEnumEventStatusFilterSchema: z.ZodType<Prisma.NestedEnumEventStatusFilter> = z.strictObject({
  equals: z.lazy(() => EventStatusSchema).optional(),
  in: z.lazy(() => EventStatusSchema).array().optional(),
  notIn: z.lazy(() => EventStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => EventStatusSchema), z.lazy(() => NestedEnumEventStatusFilterSchema) ]).optional(),
});

export default NestedEnumEventStatusFilterSchema;
