import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusSchema } from './BookingStatusSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumBookingStatusFilterSchema } from './NestedEnumBookingStatusFilterSchema';

export const NestedEnumBookingStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumBookingStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => BookingStatusSchema).optional(),
  in: z.lazy(() => BookingStatusSchema).array().optional(),
  notIn: z.lazy(() => BookingStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => BookingStatusSchema), z.lazy(() => NestedEnumBookingStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumBookingStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumBookingStatusFilterSchema).optional(),
}).strict();

export default NestedEnumBookingStatusWithAggregatesFilterSchema;
