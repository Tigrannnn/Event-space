import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusSchema } from './BookingStatusSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { PaymentMethodSchema } from './PaymentMethodSchema';
import { BookingAdjustmentUncheckedCreateNestedManyWithoutBookingInputSchema } from './BookingAdjustmentUncheckedCreateNestedManyWithoutBookingInputSchema';

export const BookingUncheckedCreateInputSchema: z.ZodType<Prisma.BookingUncheckedCreateInput> = z.object({
  id: z.uuid().optional(),
  userId: z.string(),
  eventId: z.string(),
  status: z.lazy(() => BookingStatusSchema).optional(),
  quantity: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  paymentMethod: z.lazy(() => PaymentMethodSchema).optional(),
  createdByAdminId: z.string().optional().nullable(),
  paymentIntentId: z.string().optional().nullable(),
  adjustments: z.lazy(() => BookingAdjustmentUncheckedCreateNestedManyWithoutBookingInputSchema).optional(),
}).strict();

export default BookingUncheckedCreateInputSchema;
