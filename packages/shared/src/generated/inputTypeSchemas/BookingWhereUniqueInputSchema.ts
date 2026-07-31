import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingUserIdOccurrenceIdCompoundUniqueInputSchema } from './BookingUserIdOccurrenceIdCompoundUniqueInputSchema';
import { BookingWhereInputSchema } from './BookingWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumBookingStatusFilterSchema } from './EnumBookingStatusFilterSchema';
import { BookingStatusSchema } from './BookingStatusSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DecimalFilterSchema } from './DecimalFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { EnumPaymentMethodFilterSchema } from './EnumPaymentMethodFilterSchema';
import { PaymentMethodSchema } from './PaymentMethodSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { EventOccurrenceScalarRelationFilterSchema } from './EventOccurrenceScalarRelationFilterSchema';
import { EventOccurrenceWhereInputSchema } from './EventOccurrenceWhereInputSchema';
import { BookingAdjustmentListRelationFilterSchema } from './BookingAdjustmentListRelationFilterSchema';

export const BookingWhereUniqueInputSchema: z.ZodType<Prisma.BookingWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    paymentIntentId: z.string(),
    referenceNumber: z.number().int(),
    userId_occurrenceId: z.lazy(() => BookingUserIdOccurrenceIdCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
    paymentIntentId: z.string(),
    referenceNumber: z.number().int(),
  }),
  z.object({
    id: z.uuid(),
    paymentIntentId: z.string(),
    userId_occurrenceId: z.lazy(() => BookingUserIdOccurrenceIdCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
    paymentIntentId: z.string(),
  }),
  z.object({
    id: z.uuid(),
    referenceNumber: z.number().int(),
    userId_occurrenceId: z.lazy(() => BookingUserIdOccurrenceIdCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
    referenceNumber: z.number().int(),
  }),
  z.object({
    id: z.uuid(),
    userId_occurrenceId: z.lazy(() => BookingUserIdOccurrenceIdCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    paymentIntentId: z.string(),
    referenceNumber: z.number().int(),
    userId_occurrenceId: z.lazy(() => BookingUserIdOccurrenceIdCompoundUniqueInputSchema),
  }),
  z.object({
    paymentIntentId: z.string(),
    referenceNumber: z.number().int(),
  }),
  z.object({
    paymentIntentId: z.string(),
    userId_occurrenceId: z.lazy(() => BookingUserIdOccurrenceIdCompoundUniqueInputSchema),
  }),
  z.object({
    paymentIntentId: z.string(),
  }),
  z.object({
    referenceNumber: z.number().int(),
    userId_occurrenceId: z.lazy(() => BookingUserIdOccurrenceIdCompoundUniqueInputSchema),
  }),
  z.object({
    referenceNumber: z.number().int(),
  }),
  z.object({
    userId_occurrenceId: z.lazy(() => BookingUserIdOccurrenceIdCompoundUniqueInputSchema),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  paymentIntentId: z.string().optional(),
  referenceNumber: z.number().int().optional(),
  userId_occurrenceId: z.lazy(() => BookingUserIdOccurrenceIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => BookingWhereInputSchema), z.lazy(() => BookingWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingWhereInputSchema), z.lazy(() => BookingWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  occurrenceId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumBookingStatusFilterSchema), z.lazy(() => BookingStatusSchema) ]).optional(),
  expired: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  quantity: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  paymentMethod: z.union([ z.lazy(() => EnumPaymentMethodFilterSchema), z.lazy(() => PaymentMethodSchema) ]).optional(),
  createdByAdminId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  checkedInAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  receiptSentAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  occurrence: z.union([ z.lazy(() => EventOccurrenceScalarRelationFilterSchema), z.lazy(() => EventOccurrenceWhereInputSchema) ]).optional(),
  adjustments: z.lazy(() => BookingAdjustmentListRelationFilterSchema).optional(),
}));

export default BookingWhereUniqueInputSchema;
