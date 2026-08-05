import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusSchema } from './BookingStatusSchema';
import { EnumBookingStatusFieldUpdateOperationsInputSchema } from './EnumBookingStatusFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { BookingUpdateOneRequiredWithoutStatusHistoryNestedInputSchema } from './BookingUpdateOneRequiredWithoutStatusHistoryNestedInputSchema';

export const BookingStatusHistoryUpdateInputSchema: z.ZodType<Prisma.BookingStatusHistoryUpdateInput> = z.strictObject({
  status: z.union([ z.lazy(() => BookingStatusSchema), z.lazy(() => EnumBookingStatusFieldUpdateOperationsInputSchema) ]).optional(),
  validFrom: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  validTo: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  booking: z.lazy(() => BookingUpdateOneRequiredWithoutStatusHistoryNestedInputSchema).optional(),
});

export default BookingStatusHistoryUpdateInputSchema;
