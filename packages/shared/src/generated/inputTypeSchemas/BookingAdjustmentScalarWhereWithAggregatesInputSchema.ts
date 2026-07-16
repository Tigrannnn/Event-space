import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { EnumAdjustmentTypeWithAggregatesFilterSchema } from './EnumAdjustmentTypeWithAggregatesFilterSchema';
import { AdjustmentTypeSchema } from './AdjustmentTypeSchema';
import { DecimalWithAggregatesFilterSchema } from './DecimalWithAggregatesFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { EnumAdjustmentStatusWithAggregatesFilterSchema } from './EnumAdjustmentStatusWithAggregatesFilterSchema';
import { AdjustmentStatusSchema } from './AdjustmentStatusSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const BookingAdjustmentScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.BookingAdjustmentScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => BookingAdjustmentScalarWhereWithAggregatesInputSchema), z.lazy(() => BookingAdjustmentScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingAdjustmentScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingAdjustmentScalarWhereWithAggregatesInputSchema), z.lazy(() => BookingAdjustmentScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  bookingId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumAdjustmentTypeWithAggregatesFilterSchema), z.lazy(() => AdjustmentTypeSchema) ]).optional(),
  amount: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  currency: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  stripePaymentIntentId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  stripeRefundId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => EnumAdjustmentStatusWithAggregatesFilterSchema), z.lazy(() => AdjustmentStatusSchema) ]).optional(),
  reason: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export default BookingAdjustmentScalarWhereWithAggregatesInputSchema;
