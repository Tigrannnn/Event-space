import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceStatusSchema } from './EventOccurrenceStatusSchema';

export const NestedEnumEventOccurrenceStatusFilterSchema: z.ZodType<Prisma.NestedEnumEventOccurrenceStatusFilter> = z.strictObject({
  equals: z.lazy(() => EventOccurrenceStatusSchema).optional(),
  in: z.lazy(() => EventOccurrenceStatusSchema).array().optional(),
  notIn: z.lazy(() => EventOccurrenceStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => EventOccurrenceStatusSchema), z.lazy(() => NestedEnumEventOccurrenceStatusFilterSchema) ]).optional(),
});

export default NestedEnumEventOccurrenceStatusFilterSchema;
