import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { EnumBookingStatusWithAggregatesFilterSchema } from './EnumBookingStatusWithAggregatesFilterSchema';
import { BookingStatusSchema } from './BookingStatusSchema';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { DecimalWithAggregatesFilterSchema } from './DecimalWithAggregatesFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { EnumPaymentMethodWithAggregatesFilterSchema } from './EnumPaymentMethodWithAggregatesFilterSchema';
import { PaymentMethodSchema } from './PaymentMethodSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { IntNullableWithAggregatesFilterSchema } from './IntNullableWithAggregatesFilterSchema';
import { DateTimeNullableWithAggregatesFilterSchema } from './DateTimeNullableWithAggregatesFilterSchema';

export const BookingScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.BookingScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => BookingScalarWhereWithAggregatesInputSchema), z.lazy(() => BookingScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingScalarWhereWithAggregatesInputSchema), z.lazy(() => BookingScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  eventId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumBookingStatusWithAggregatesFilterSchema), z.lazy(() => BookingStatusSchema) ]).optional(),
  quantity: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  amount: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  paymentMethod: z.union([ z.lazy(() => EnumPaymentMethodWithAggregatesFilterSchema), z.lazy(() => PaymentMethodSchema) ]).optional(),
  createdByAdminId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  paymentIntentId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  referenceNumber: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema), z.number() ]).optional().nullable(),
  checkedInAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
}).strict();

export default BookingScalarWhereWithAggregatesInputSchema;
