import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusHistoryCreateWithoutBookingInputSchema } from './BookingStatusHistoryCreateWithoutBookingInputSchema';
import { BookingStatusHistoryUncheckedCreateWithoutBookingInputSchema } from './BookingStatusHistoryUncheckedCreateWithoutBookingInputSchema';
import { BookingStatusHistoryCreateOrConnectWithoutBookingInputSchema } from './BookingStatusHistoryCreateOrConnectWithoutBookingInputSchema';
import { BookingStatusHistoryCreateManyBookingInputEnvelopeSchema } from './BookingStatusHistoryCreateManyBookingInputEnvelopeSchema';
import { BookingStatusHistoryWhereUniqueInputSchema } from './BookingStatusHistoryWhereUniqueInputSchema';

export const BookingStatusHistoryUncheckedCreateNestedManyWithoutBookingInputSchema: z.ZodType<Prisma.BookingStatusHistoryUncheckedCreateNestedManyWithoutBookingInput> = z.strictObject({
  create: z.union([ z.lazy(() => BookingStatusHistoryCreateWithoutBookingInputSchema), z.lazy(() => BookingStatusHistoryCreateWithoutBookingInputSchema).array(), z.lazy(() => BookingStatusHistoryUncheckedCreateWithoutBookingInputSchema), z.lazy(() => BookingStatusHistoryUncheckedCreateWithoutBookingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingStatusHistoryCreateOrConnectWithoutBookingInputSchema), z.lazy(() => BookingStatusHistoryCreateOrConnectWithoutBookingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingStatusHistoryCreateManyBookingInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BookingStatusHistoryWhereUniqueInputSchema), z.lazy(() => BookingStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
});

export default BookingStatusHistoryUncheckedCreateNestedManyWithoutBookingInputSchema;
