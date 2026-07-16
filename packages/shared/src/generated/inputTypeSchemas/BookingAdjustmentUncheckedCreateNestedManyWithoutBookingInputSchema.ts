import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingAdjustmentCreateWithoutBookingInputSchema } from './BookingAdjustmentCreateWithoutBookingInputSchema';
import { BookingAdjustmentUncheckedCreateWithoutBookingInputSchema } from './BookingAdjustmentUncheckedCreateWithoutBookingInputSchema';
import { BookingAdjustmentCreateOrConnectWithoutBookingInputSchema } from './BookingAdjustmentCreateOrConnectWithoutBookingInputSchema';
import { BookingAdjustmentCreateManyBookingInputEnvelopeSchema } from './BookingAdjustmentCreateManyBookingInputEnvelopeSchema';
import { BookingAdjustmentWhereUniqueInputSchema } from './BookingAdjustmentWhereUniqueInputSchema';

export const BookingAdjustmentUncheckedCreateNestedManyWithoutBookingInputSchema: z.ZodType<Prisma.BookingAdjustmentUncheckedCreateNestedManyWithoutBookingInput> = z.strictObject({
  create: z.union([ z.lazy(() => BookingAdjustmentCreateWithoutBookingInputSchema), z.lazy(() => BookingAdjustmentCreateWithoutBookingInputSchema).array(), z.lazy(() => BookingAdjustmentUncheckedCreateWithoutBookingInputSchema), z.lazy(() => BookingAdjustmentUncheckedCreateWithoutBookingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingAdjustmentCreateOrConnectWithoutBookingInputSchema), z.lazy(() => BookingAdjustmentCreateOrConnectWithoutBookingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingAdjustmentCreateManyBookingInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BookingAdjustmentWhereUniqueInputSchema), z.lazy(() => BookingAdjustmentWhereUniqueInputSchema).array() ]).optional(),
});

export default BookingAdjustmentUncheckedCreateNestedManyWithoutBookingInputSchema;
