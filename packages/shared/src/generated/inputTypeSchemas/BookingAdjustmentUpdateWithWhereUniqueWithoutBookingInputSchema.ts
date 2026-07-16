import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingAdjustmentWhereUniqueInputSchema } from './BookingAdjustmentWhereUniqueInputSchema';
import { BookingAdjustmentUpdateWithoutBookingInputSchema } from './BookingAdjustmentUpdateWithoutBookingInputSchema';
import { BookingAdjustmentUncheckedUpdateWithoutBookingInputSchema } from './BookingAdjustmentUncheckedUpdateWithoutBookingInputSchema';

export const BookingAdjustmentUpdateWithWhereUniqueWithoutBookingInputSchema: z.ZodType<Prisma.BookingAdjustmentUpdateWithWhereUniqueWithoutBookingInput> = z.strictObject({
  where: z.lazy(() => BookingAdjustmentWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => BookingAdjustmentUpdateWithoutBookingInputSchema), z.lazy(() => BookingAdjustmentUncheckedUpdateWithoutBookingInputSchema) ]),
});

export default BookingAdjustmentUpdateWithWhereUniqueWithoutBookingInputSchema;
