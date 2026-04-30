import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusSchema } from './BookingStatusSchema';
import { NestedEnumBookingStatusFilterSchema } from './NestedEnumBookingStatusFilterSchema';

export const EnumBookingStatusFilterSchema: z.ZodType<Prisma.EnumBookingStatusFilter> = z.object({
  equals: z.lazy(() => BookingStatusSchema).optional(),
  in: z.lazy(() => BookingStatusSchema).array().optional(),
  notIn: z.lazy(() => BookingStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => BookingStatusSchema), z.lazy(() => NestedEnumBookingStatusFilterSchema) ]).optional(),
}).strict();

export default EnumBookingStatusFilterSchema;
