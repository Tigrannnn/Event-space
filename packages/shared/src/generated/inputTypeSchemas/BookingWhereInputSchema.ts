import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumBookingStatusFilterSchema } from './EnumBookingStatusFilterSchema';
import { BookingStatusSchema } from './BookingStatusSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DecimalFilterSchema } from './DecimalFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { EnumPaymentMethodFilterSchema } from './EnumPaymentMethodFilterSchema';
import { PaymentMethodSchema } from './PaymentMethodSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { EventScalarRelationFilterSchema } from './EventScalarRelationFilterSchema';
import { EventWhereInputSchema } from './EventWhereInputSchema';
import { BookingAdjustmentListRelationFilterSchema } from './BookingAdjustmentListRelationFilterSchema';

export const BookingWhereInputSchema: z.ZodType<Prisma.BookingWhereInput> = z.object({
  AND: z.union([ z.lazy(() => BookingWhereInputSchema), z.lazy(() => BookingWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingWhereInputSchema), z.lazy(() => BookingWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  eventId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumBookingStatusFilterSchema), z.lazy(() => BookingStatusSchema) ]).optional(),
  quantity: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  paymentMethod: z.union([ z.lazy(() => EnumPaymentMethodFilterSchema), z.lazy(() => PaymentMethodSchema) ]).optional(),
  createdByAdminId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  paymentIntentId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  event: z.union([ z.lazy(() => EventScalarRelationFilterSchema), z.lazy(() => EventWhereInputSchema) ]).optional(),
  adjustments: z.lazy(() => BookingAdjustmentListRelationFilterSchema).optional(),
}).strict();

export default BookingWhereInputSchema;
