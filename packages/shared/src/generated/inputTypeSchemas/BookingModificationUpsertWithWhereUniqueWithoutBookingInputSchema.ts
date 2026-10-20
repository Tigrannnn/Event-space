import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingModificationWhereUniqueInputSchema } from './BookingModificationWhereUniqueInputSchema';
import { BookingModificationUpdateWithoutBookingInputSchema } from './BookingModificationUpdateWithoutBookingInputSchema';
import { BookingModificationUncheckedUpdateWithoutBookingInputSchema } from './BookingModificationUncheckedUpdateWithoutBookingInputSchema';
import { BookingModificationCreateWithoutBookingInputSchema } from './BookingModificationCreateWithoutBookingInputSchema';
import { BookingModificationUncheckedCreateWithoutBookingInputSchema } from './BookingModificationUncheckedCreateWithoutBookingInputSchema';

export const BookingModificationUpsertWithWhereUniqueWithoutBookingInputSchema: z.ZodType<Prisma.BookingModificationUpsertWithWhereUniqueWithoutBookingInput> = z.strictObject({
  where: z.lazy(() => BookingModificationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BookingModificationUpdateWithoutBookingInputSchema), z.lazy(() => BookingModificationUncheckedUpdateWithoutBookingInputSchema) ]),
  create: z.union([ z.lazy(() => BookingModificationCreateWithoutBookingInputSchema), z.lazy(() => BookingModificationUncheckedCreateWithoutBookingInputSchema) ]),
});

export default BookingModificationUpsertWithWhereUniqueWithoutBookingInputSchema;
