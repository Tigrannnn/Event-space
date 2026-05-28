import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusSchema } from './BookingStatusSchema';
import { UserCreateNestedOneWithoutBookingsInputSchema } from './UserCreateNestedOneWithoutBookingsInputSchema';
import { EventCreateNestedOneWithoutBookingsInputSchema } from './EventCreateNestedOneWithoutBookingsInputSchema';

export const BookingCreateInputSchema: z.ZodType<Prisma.BookingCreateInput> = z.object({
  id: z.uuid().optional(),
  status: z.lazy(() => BookingStatusSchema).optional(),
  quantity: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  paymentIntentId: z.string().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutBookingsInputSchema),
  event: z.lazy(() => EventCreateNestedOneWithoutBookingsInputSchema),
}).strict();

export default BookingCreateInputSchema;
