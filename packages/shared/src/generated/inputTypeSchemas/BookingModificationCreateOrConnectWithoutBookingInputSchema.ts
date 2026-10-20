import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingModificationWhereUniqueInputSchema } from './BookingModificationWhereUniqueInputSchema';
import { BookingModificationCreateWithoutBookingInputSchema } from './BookingModificationCreateWithoutBookingInputSchema';
import { BookingModificationUncheckedCreateWithoutBookingInputSchema } from './BookingModificationUncheckedCreateWithoutBookingInputSchema';

export const BookingModificationCreateOrConnectWithoutBookingInputSchema: z.ZodType<Prisma.BookingModificationCreateOrConnectWithoutBookingInput> = z.strictObject({
  where: z.lazy(() => BookingModificationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BookingModificationCreateWithoutBookingInputSchema), z.lazy(() => BookingModificationUncheckedCreateWithoutBookingInputSchema) ]),
});

export default BookingModificationCreateOrConnectWithoutBookingInputSchema;
