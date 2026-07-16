import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusSchema } from './BookingStatusSchema';
import { NestedEnumBookingStatusWithAggregatesFilterSchema } from './NestedEnumBookingStatusWithAggregatesFilterSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumBookingStatusFilterSchema } from './NestedEnumBookingStatusFilterSchema';

export const EnumBookingStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumBookingStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => BookingStatusSchema).optional(),
  in: z.lazy(() => BookingStatusSchema).array().optional(),
  notIn: z.lazy(() => BookingStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => BookingStatusSchema), z.lazy(() => NestedEnumBookingStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumBookingStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumBookingStatusFilterSchema).optional(),
});

export default EnumBookingStatusWithAggregatesFilterSchema;
