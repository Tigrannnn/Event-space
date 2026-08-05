import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusHistoryWhereUniqueInputSchema } from './BookingStatusHistoryWhereUniqueInputSchema';
import { BookingStatusHistoryUpdateWithoutBookingInputSchema } from './BookingStatusHistoryUpdateWithoutBookingInputSchema';
import { BookingStatusHistoryUncheckedUpdateWithoutBookingInputSchema } from './BookingStatusHistoryUncheckedUpdateWithoutBookingInputSchema';
import { BookingStatusHistoryCreateWithoutBookingInputSchema } from './BookingStatusHistoryCreateWithoutBookingInputSchema';
import { BookingStatusHistoryUncheckedCreateWithoutBookingInputSchema } from './BookingStatusHistoryUncheckedCreateWithoutBookingInputSchema';

export const BookingStatusHistoryUpsertWithWhereUniqueWithoutBookingInputSchema: z.ZodType<Prisma.BookingStatusHistoryUpsertWithWhereUniqueWithoutBookingInput> = z.strictObject({
  where: z.lazy(() => BookingStatusHistoryWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BookingStatusHistoryUpdateWithoutBookingInputSchema), z.lazy(() => BookingStatusHistoryUncheckedUpdateWithoutBookingInputSchema) ]),
  create: z.union([ z.lazy(() => BookingStatusHistoryCreateWithoutBookingInputSchema), z.lazy(() => BookingStatusHistoryUncheckedCreateWithoutBookingInputSchema) ]),
});

export default BookingStatusHistoryUpsertWithWhereUniqueWithoutBookingInputSchema;
