import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingModificationCreateWithoutBookingInputSchema } from './BookingModificationCreateWithoutBookingInputSchema';
import { BookingModificationUncheckedCreateWithoutBookingInputSchema } from './BookingModificationUncheckedCreateWithoutBookingInputSchema';
import { BookingModificationCreateOrConnectWithoutBookingInputSchema } from './BookingModificationCreateOrConnectWithoutBookingInputSchema';
import { BookingModificationCreateManyBookingInputEnvelopeSchema } from './BookingModificationCreateManyBookingInputEnvelopeSchema';
import { BookingModificationWhereUniqueInputSchema } from './BookingModificationWhereUniqueInputSchema';

export const BookingModificationCreateNestedManyWithoutBookingInputSchema: z.ZodType<Prisma.BookingModificationCreateNestedManyWithoutBookingInput> = z.strictObject({
  create: z.union([ z.lazy(() => BookingModificationCreateWithoutBookingInputSchema), z.lazy(() => BookingModificationCreateWithoutBookingInputSchema).array(), z.lazy(() => BookingModificationUncheckedCreateWithoutBookingInputSchema), z.lazy(() => BookingModificationUncheckedCreateWithoutBookingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingModificationCreateOrConnectWithoutBookingInputSchema), z.lazy(() => BookingModificationCreateOrConnectWithoutBookingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingModificationCreateManyBookingInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BookingModificationWhereUniqueInputSchema), z.lazy(() => BookingModificationWhereUniqueInputSchema).array() ]).optional(),
});

export default BookingModificationCreateNestedManyWithoutBookingInputSchema;
