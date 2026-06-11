import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusSchema } from './BookingStatusSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { EventCreateNestedOneWithoutBookingsInputSchema } from './EventCreateNestedOneWithoutBookingsInputSchema';
import { BookingAdjustmentCreateNestedManyWithoutBookingInputSchema } from './BookingAdjustmentCreateNestedManyWithoutBookingInputSchema';

export const BookingCreateWithoutUserInputSchema: z.ZodType<Prisma.BookingCreateWithoutUserInput> = z.object({
  id: z.uuid().optional(),
  status: z.lazy(() => BookingStatusSchema).optional(),
  quantity: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  paymentIntentId: z.string().optional().nullable(),
  event: z.lazy(() => EventCreateNestedOneWithoutBookingsInputSchema),
  adjustments: z.lazy(() => BookingAdjustmentCreateNestedManyWithoutBookingInputSchema).optional(),
}).strict();

export default BookingCreateWithoutUserInputSchema;
