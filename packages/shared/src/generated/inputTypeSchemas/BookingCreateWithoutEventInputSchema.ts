import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusSchema } from './BookingStatusSchema';
import { UserCreateNestedOneWithoutBookingsInputSchema } from './UserCreateNestedOneWithoutBookingsInputSchema';

export const BookingCreateWithoutEventInputSchema: z.ZodType<Prisma.BookingCreateWithoutEventInput> = z.object({
  id: z.uuid().optional(),
  status: z.lazy(() => BookingStatusSchema).optional(),
  quantity: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutBookingsInputSchema),
}).strict();

export default BookingCreateWithoutEventInputSchema;
