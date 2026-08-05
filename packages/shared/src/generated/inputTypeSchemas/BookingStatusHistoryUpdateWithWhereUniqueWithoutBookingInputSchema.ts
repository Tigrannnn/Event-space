import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusHistoryWhereUniqueInputSchema } from './BookingStatusHistoryWhereUniqueInputSchema';
import { BookingStatusHistoryUpdateWithoutBookingInputSchema } from './BookingStatusHistoryUpdateWithoutBookingInputSchema';
import { BookingStatusHistoryUncheckedUpdateWithoutBookingInputSchema } from './BookingStatusHistoryUncheckedUpdateWithoutBookingInputSchema';

export const BookingStatusHistoryUpdateWithWhereUniqueWithoutBookingInputSchema: z.ZodType<Prisma.BookingStatusHistoryUpdateWithWhereUniqueWithoutBookingInput> = z.strictObject({
  where: z.lazy(() => BookingStatusHistoryWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => BookingStatusHistoryUpdateWithoutBookingInputSchema), z.lazy(() => BookingStatusHistoryUncheckedUpdateWithoutBookingInputSchema) ]),
});

export default BookingStatusHistoryUpdateWithWhereUniqueWithoutBookingInputSchema;
