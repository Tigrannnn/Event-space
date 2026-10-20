import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingModificationWhereUniqueInputSchema } from './BookingModificationWhereUniqueInputSchema';
import { BookingModificationUpdateWithoutBookingInputSchema } from './BookingModificationUpdateWithoutBookingInputSchema';
import { BookingModificationUncheckedUpdateWithoutBookingInputSchema } from './BookingModificationUncheckedUpdateWithoutBookingInputSchema';

export const BookingModificationUpdateWithWhereUniqueWithoutBookingInputSchema: z.ZodType<Prisma.BookingModificationUpdateWithWhereUniqueWithoutBookingInput> = z.strictObject({
  where: z.lazy(() => BookingModificationWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => BookingModificationUpdateWithoutBookingInputSchema), z.lazy(() => BookingModificationUncheckedUpdateWithoutBookingInputSchema) ]),
});

export default BookingModificationUpdateWithWhereUniqueWithoutBookingInputSchema;
