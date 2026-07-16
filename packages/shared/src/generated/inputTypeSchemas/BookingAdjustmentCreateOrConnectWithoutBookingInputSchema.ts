import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingAdjustmentWhereUniqueInputSchema } from './BookingAdjustmentWhereUniqueInputSchema';
import { BookingAdjustmentCreateWithoutBookingInputSchema } from './BookingAdjustmentCreateWithoutBookingInputSchema';
import { BookingAdjustmentUncheckedCreateWithoutBookingInputSchema } from './BookingAdjustmentUncheckedCreateWithoutBookingInputSchema';

export const BookingAdjustmentCreateOrConnectWithoutBookingInputSchema: z.ZodType<Prisma.BookingAdjustmentCreateOrConnectWithoutBookingInput> = z.strictObject({
  where: z.lazy(() => BookingAdjustmentWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BookingAdjustmentCreateWithoutBookingInputSchema), z.lazy(() => BookingAdjustmentUncheckedCreateWithoutBookingInputSchema) ]),
});

export default BookingAdjustmentCreateOrConnectWithoutBookingInputSchema;
