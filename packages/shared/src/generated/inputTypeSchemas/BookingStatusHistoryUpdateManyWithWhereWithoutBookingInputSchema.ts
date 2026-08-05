import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusHistoryScalarWhereInputSchema } from './BookingStatusHistoryScalarWhereInputSchema';
import { BookingStatusHistoryUpdateManyMutationInputSchema } from './BookingStatusHistoryUpdateManyMutationInputSchema';
import { BookingStatusHistoryUncheckedUpdateManyWithoutBookingInputSchema } from './BookingStatusHistoryUncheckedUpdateManyWithoutBookingInputSchema';

export const BookingStatusHistoryUpdateManyWithWhereWithoutBookingInputSchema: z.ZodType<Prisma.BookingStatusHistoryUpdateManyWithWhereWithoutBookingInput> = z.strictObject({
  where: z.lazy(() => BookingStatusHistoryScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BookingStatusHistoryUpdateManyMutationInputSchema), z.lazy(() => BookingStatusHistoryUncheckedUpdateManyWithoutBookingInputSchema) ]),
});

export default BookingStatusHistoryUpdateManyWithWhereWithoutBookingInputSchema;
