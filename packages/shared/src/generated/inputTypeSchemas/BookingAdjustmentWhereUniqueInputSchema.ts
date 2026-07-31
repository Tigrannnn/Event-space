import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingAdjustmentStripePaymentIntentIdTypeCompoundUniqueInputSchema } from './BookingAdjustmentStripePaymentIntentIdTypeCompoundUniqueInputSchema';
import { BookingAdjustmentWhereInputSchema } from './BookingAdjustmentWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumAdjustmentTypeFilterSchema } from './EnumAdjustmentTypeFilterSchema';
import { AdjustmentTypeSchema } from './AdjustmentTypeSchema';
import { DecimalFilterSchema } from './DecimalFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { EnumAdjustmentStatusFilterSchema } from './EnumAdjustmentStatusFilterSchema';
import { AdjustmentStatusSchema } from './AdjustmentStatusSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { BookingScalarRelationFilterSchema } from './BookingScalarRelationFilterSchema';
import { BookingWhereInputSchema } from './BookingWhereInputSchema';

export const BookingAdjustmentWhereUniqueInputSchema: z.ZodType<Prisma.BookingAdjustmentWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    stripeRefundId: z.string(),
    stripePaymentIntentId_type: z.lazy(() => BookingAdjustmentStripePaymentIntentIdTypeCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
    stripeRefundId: z.string(),
  }),
  z.object({
    id: z.uuid(),
    stripePaymentIntentId_type: z.lazy(() => BookingAdjustmentStripePaymentIntentIdTypeCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    stripeRefundId: z.string(),
    stripePaymentIntentId_type: z.lazy(() => BookingAdjustmentStripePaymentIntentIdTypeCompoundUniqueInputSchema),
  }),
  z.object({
    stripeRefundId: z.string(),
  }),
  z.object({
    stripePaymentIntentId_type: z.lazy(() => BookingAdjustmentStripePaymentIntentIdTypeCompoundUniqueInputSchema),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  stripeRefundId: z.string().optional(),
  stripePaymentIntentId_type: z.lazy(() => BookingAdjustmentStripePaymentIntentIdTypeCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => BookingAdjustmentWhereInputSchema), z.lazy(() => BookingAdjustmentWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingAdjustmentWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingAdjustmentWhereInputSchema), z.lazy(() => BookingAdjustmentWhereInputSchema).array() ]).optional(),
  bookingId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumAdjustmentTypeFilterSchema), z.lazy(() => AdjustmentTypeSchema) ]).optional(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  currency: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  stripePaymentIntentId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => EnumAdjustmentStatusFilterSchema), z.lazy(() => AdjustmentStatusSchema) ]).optional(),
  reason: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  booking: z.union([ z.lazy(() => BookingScalarRelationFilterSchema), z.lazy(() => BookingWhereInputSchema) ]).optional(),
}));

export default BookingAdjustmentWhereUniqueInputSchema;
