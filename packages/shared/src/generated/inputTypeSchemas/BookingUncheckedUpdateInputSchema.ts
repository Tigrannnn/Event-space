import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { BookingStatusSchema } from './BookingStatusSchema';
import { EnumBookingStatusFieldUpdateOperationsInputSchema } from './EnumBookingStatusFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { DecimalFieldUpdateOperationsInputSchema } from './DecimalFieldUpdateOperationsInputSchema';
import { PaymentMethodSchema } from './PaymentMethodSchema';
import { EnumPaymentMethodFieldUpdateOperationsInputSchema } from './EnumPaymentMethodFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { NullableIntFieldUpdateOperationsInputSchema } from './NullableIntFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { BookingAdjustmentUncheckedUpdateManyWithoutBookingNestedInputSchema } from './BookingAdjustmentUncheckedUpdateManyWithoutBookingNestedInputSchema';

export const BookingUncheckedUpdateInputSchema: z.ZodType<Prisma.BookingUncheckedUpdateInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  eventId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingStatusSchema), z.lazy(() => EnumBookingStatusFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  paymentMethod: z.union([ z.lazy(() => PaymentMethodSchema), z.lazy(() => EnumPaymentMethodFieldUpdateOperationsInputSchema) ]).optional(),
  createdByAdminId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentIntentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  referenceNumber: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  checkedInAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  adjustments: z.lazy(() => BookingAdjustmentUncheckedUpdateManyWithoutBookingNestedInputSchema).optional(),
}).strict();

export default BookingUncheckedUpdateInputSchema;
