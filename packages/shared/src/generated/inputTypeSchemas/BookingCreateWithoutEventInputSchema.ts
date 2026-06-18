import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusSchema } from './BookingStatusSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { PaymentMethodSchema } from './PaymentMethodSchema';
import { UserCreateNestedOneWithoutBookingsInputSchema } from './UserCreateNestedOneWithoutBookingsInputSchema';
import { BookingAdjustmentCreateNestedManyWithoutBookingInputSchema } from './BookingAdjustmentCreateNestedManyWithoutBookingInputSchema';

export const BookingCreateWithoutEventInputSchema: z.ZodType<Prisma.BookingCreateWithoutEventInput> = z.object({
  id: z.uuid().optional(),
  status: z.lazy(() => BookingStatusSchema).optional(),
  quantity: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  paymentMethod: z.lazy(() => PaymentMethodSchema).optional(),
  createdByAdminId: z.string().optional().nullable(),
  paymentIntentId: z.string().optional().nullable(),
  referenceNumber: z.number().int().optional().nullable(),
  checkedInAt: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutBookingsInputSchema),
  adjustments: z.lazy(() => BookingAdjustmentCreateNestedManyWithoutBookingInputSchema).optional(),
}).strict();

export default BookingCreateWithoutEventInputSchema;
