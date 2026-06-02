import { Prisma } from '@prisma/client';

import { z } from 'zod';
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

export const BookingAdjustmentScalarWhereInputSchema: z.ZodType<Prisma.BookingAdjustmentScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => BookingAdjustmentScalarWhereInputSchema), z.lazy(() => BookingAdjustmentScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingAdjustmentScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingAdjustmentScalarWhereInputSchema), z.lazy(() => BookingAdjustmentScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  bookingId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumAdjustmentTypeFilterSchema), z.lazy(() => AdjustmentTypeSchema) ]).optional(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  currency: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  stripePaymentIntentId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  stripeRefundId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => EnumAdjustmentStatusFilterSchema), z.lazy(() => AdjustmentStatusSchema) ]).optional(),
  reason: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
}).strict();

export default BookingAdjustmentScalarWhereInputSchema;
