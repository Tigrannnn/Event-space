import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdjustmentTypeSchema } from './AdjustmentTypeSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { AdjustmentStatusSchema } from './AdjustmentStatusSchema';

export const BookingAdjustmentCreateManyInputSchema: z.ZodType<Prisma.BookingAdjustmentCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  bookingId: z.string(),
  type: z.lazy(() => AdjustmentTypeSchema),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  currency: z.string().optional(),
  stripePaymentIntentId: z.string().optional().nullable(),
  stripeRefundId: z.string().optional().nullable(),
  status: z.lazy(() => AdjustmentStatusSchema),
  reason: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export default BookingAdjustmentCreateManyInputSchema;
