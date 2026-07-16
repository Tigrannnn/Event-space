import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingAdjustmentWhereUniqueInputSchema } from './BookingAdjustmentWhereUniqueInputSchema';
import { BookingAdjustmentUpdateWithoutBookingInputSchema } from './BookingAdjustmentUpdateWithoutBookingInputSchema';
import { BookingAdjustmentUncheckedUpdateWithoutBookingInputSchema } from './BookingAdjustmentUncheckedUpdateWithoutBookingInputSchema';
import { BookingAdjustmentCreateWithoutBookingInputSchema } from './BookingAdjustmentCreateWithoutBookingInputSchema';
import { BookingAdjustmentUncheckedCreateWithoutBookingInputSchema } from './BookingAdjustmentUncheckedCreateWithoutBookingInputSchema';

export const BookingAdjustmentUpsertWithWhereUniqueWithoutBookingInputSchema: z.ZodType<Prisma.BookingAdjustmentUpsertWithWhereUniqueWithoutBookingInput> = z.strictObject({
  where: z.lazy(() => BookingAdjustmentWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BookingAdjustmentUpdateWithoutBookingInputSchema), z.lazy(() => BookingAdjustmentUncheckedUpdateWithoutBookingInputSchema) ]),
  create: z.union([ z.lazy(() => BookingAdjustmentCreateWithoutBookingInputSchema), z.lazy(() => BookingAdjustmentUncheckedCreateWithoutBookingInputSchema) ]),
});

export default BookingAdjustmentUpsertWithWhereUniqueWithoutBookingInputSchema;
