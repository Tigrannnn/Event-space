import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusHistoryWhereInputSchema } from './BookingStatusHistoryWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumBookingStatusFilterSchema } from './EnumBookingStatusFilterSchema';
import { BookingStatusSchema } from './BookingStatusSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { BookingScalarRelationFilterSchema } from './BookingScalarRelationFilterSchema';
import { BookingWhereInputSchema } from './BookingWhereInputSchema';

export const BookingStatusHistoryWhereUniqueInputSchema: z.ZodType<Prisma.BookingStatusHistoryWhereUniqueInput> = z.object({
  id: z.number().int(),
})
.and(z.strictObject({
  id: z.number().int().optional(),
  AND: z.union([ z.lazy(() => BookingStatusHistoryWhereInputSchema), z.lazy(() => BookingStatusHistoryWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingStatusHistoryWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingStatusHistoryWhereInputSchema), z.lazy(() => BookingStatusHistoryWhereInputSchema).array() ]).optional(),
  bookingId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumBookingStatusFilterSchema), z.lazy(() => BookingStatusSchema) ]).optional(),
  validFrom: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  validTo: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  booking: z.union([ z.lazy(() => BookingScalarRelationFilterSchema), z.lazy(() => BookingWhereInputSchema) ]).optional(),
}));

export default BookingStatusHistoryWhereUniqueInputSchema;
