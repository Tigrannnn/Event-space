import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceStatusSchema } from './EventOccurrenceStatusSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumEventOccurrenceStatusFilterSchema } from './NestedEnumEventOccurrenceStatusFilterSchema';

export const NestedEnumEventOccurrenceStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumEventOccurrenceStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => EventOccurrenceStatusSchema).optional(),
  in: z.lazy(() => EventOccurrenceStatusSchema).array().optional(),
  notIn: z.lazy(() => EventOccurrenceStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => EventOccurrenceStatusSchema), z.lazy(() => NestedEnumEventOccurrenceStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumEventOccurrenceStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumEventOccurrenceStatusFilterSchema).optional(),
});

export default NestedEnumEventOccurrenceStatusWithAggregatesFilterSchema;
