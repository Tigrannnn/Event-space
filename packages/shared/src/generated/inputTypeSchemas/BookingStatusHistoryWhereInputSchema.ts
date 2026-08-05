import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { IntFilterSchema } from './IntFilterSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumBookingStatusFilterSchema } from './EnumBookingStatusFilterSchema';
import { BookingStatusSchema } from './BookingStatusSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { BookingScalarRelationFilterSchema } from './BookingScalarRelationFilterSchema';
import { BookingWhereInputSchema } from './BookingWhereInputSchema';

export const BookingStatusHistoryWhereInputSchema: z.ZodType<Prisma.BookingStatusHistoryWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => BookingStatusHistoryWhereInputSchema), z.lazy(() => BookingStatusHistoryWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingStatusHistoryWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingStatusHistoryWhereInputSchema), z.lazy(() => BookingStatusHistoryWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  bookingId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumBookingStatusFilterSchema), z.lazy(() => BookingStatusSchema) ]).optional(),
  validFrom: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  validTo: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  booking: z.union([ z.lazy(() => BookingScalarRelationFilterSchema), z.lazy(() => BookingWhereInputSchema) ]).optional(),
});

export default BookingStatusHistoryWhereInputSchema;
