import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { BookingStatusSchema } from './BookingStatusSchema';
import { EnumBookingStatusFieldUpdateOperationsInputSchema } from './EnumBookingStatusFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { UserUpdateOneRequiredWithoutBookingsNestedInputSchema } from './UserUpdateOneRequiredWithoutBookingsNestedInputSchema';

export const BookingUpdateWithoutEventInputSchema: z.ZodType<Prisma.BookingUpdateWithoutEventInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => BookingStatusSchema), z.lazy(() => EnumBookingStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutBookingsNestedInputSchema).optional(),
}).strict();

export default BookingUpdateWithoutEventInputSchema;
