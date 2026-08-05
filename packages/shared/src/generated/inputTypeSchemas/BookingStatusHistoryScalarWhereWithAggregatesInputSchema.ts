import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { EnumBookingStatusWithAggregatesFilterSchema } from './EnumBookingStatusWithAggregatesFilterSchema';
import { BookingStatusSchema } from './BookingStatusSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { DateTimeNullableWithAggregatesFilterSchema } from './DateTimeNullableWithAggregatesFilterSchema';

export const BookingStatusHistoryScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.BookingStatusHistoryScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => BookingStatusHistoryScalarWhereWithAggregatesInputSchema), z.lazy(() => BookingStatusHistoryScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingStatusHistoryScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingStatusHistoryScalarWhereWithAggregatesInputSchema), z.lazy(() => BookingStatusHistoryScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  bookingId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumBookingStatusWithAggregatesFilterSchema), z.lazy(() => BookingStatusSchema) ]).optional(),
  validFrom: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  validTo: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export default BookingStatusHistoryScalarWhereWithAggregatesInputSchema;
