import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { ModificationStatusSchema } from './ModificationStatusSchema';

export const BookingModificationCreateWithoutBookingInputSchema: z.ZodType<Prisma.BookingModificationCreateWithoutBookingInput> = z.strictObject({
  id: z.uuid().optional(),
  fromQuantity: z.number().int(),
  toQuantity: z.number().int(),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  paymentIntentId: z.string().optional().nullable(),
  status: z.lazy(() => ModificationStatusSchema).optional(),
  failureReason: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  appliedAt: z.coerce.date().optional().nullable(),
});

export default BookingModificationCreateWithoutBookingInputSchema;
