import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { IntFilterSchema } from './IntFilterSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumBookingStatusFilterSchema } from './EnumBookingStatusFilterSchema';
import { BookingStatusSchema } from './BookingStatusSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';

export const BookingStatusHistoryScalarWhereInputSchema: z.ZodType<Prisma.BookingStatusHistoryScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => BookingStatusHistoryScalarWhereInputSchema), z.lazy(() => BookingStatusHistoryScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingStatusHistoryScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingStatusHistoryScalarWhereInputSchema), z.lazy(() => BookingStatusHistoryScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  bookingId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumBookingStatusFilterSchema), z.lazy(() => BookingStatusSchema) ]).optional(),
  validFrom: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  validTo: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export default BookingStatusHistoryScalarWhereInputSchema;
