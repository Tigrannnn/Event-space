import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusHistoryWhereUniqueInputSchema } from './BookingStatusHistoryWhereUniqueInputSchema';
import { BookingStatusHistoryCreateWithoutBookingInputSchema } from './BookingStatusHistoryCreateWithoutBookingInputSchema';
import { BookingStatusHistoryUncheckedCreateWithoutBookingInputSchema } from './BookingStatusHistoryUncheckedCreateWithoutBookingInputSchema';

export const BookingStatusHistoryCreateOrConnectWithoutBookingInputSchema: z.ZodType<Prisma.BookingStatusHistoryCreateOrConnectWithoutBookingInput> = z.strictObject({
  where: z.lazy(() => BookingStatusHistoryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BookingStatusHistoryCreateWithoutBookingInputSchema), z.lazy(() => BookingStatusHistoryUncheckedCreateWithoutBookingInputSchema) ]),
});

export default BookingStatusHistoryCreateOrConnectWithoutBookingInputSchema;
