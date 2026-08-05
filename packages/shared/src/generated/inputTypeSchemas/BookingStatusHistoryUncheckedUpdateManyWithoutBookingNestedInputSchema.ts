import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusHistoryCreateWithoutBookingInputSchema } from './BookingStatusHistoryCreateWithoutBookingInputSchema';
import { BookingStatusHistoryUncheckedCreateWithoutBookingInputSchema } from './BookingStatusHistoryUncheckedCreateWithoutBookingInputSchema';
import { BookingStatusHistoryCreateOrConnectWithoutBookingInputSchema } from './BookingStatusHistoryCreateOrConnectWithoutBookingInputSchema';
import { BookingStatusHistoryUpsertWithWhereUniqueWithoutBookingInputSchema } from './BookingStatusHistoryUpsertWithWhereUniqueWithoutBookingInputSchema';
import { BookingStatusHistoryCreateManyBookingInputEnvelopeSchema } from './BookingStatusHistoryCreateManyBookingInputEnvelopeSchema';
import { BookingStatusHistoryWhereUniqueInputSchema } from './BookingStatusHistoryWhereUniqueInputSchema';
import { BookingStatusHistoryUpdateWithWhereUniqueWithoutBookingInputSchema } from './BookingStatusHistoryUpdateWithWhereUniqueWithoutBookingInputSchema';
import { BookingStatusHistoryUpdateManyWithWhereWithoutBookingInputSchema } from './BookingStatusHistoryUpdateManyWithWhereWithoutBookingInputSchema';
import { BookingStatusHistoryScalarWhereInputSchema } from './BookingStatusHistoryScalarWhereInputSchema';

export const BookingStatusHistoryUncheckedUpdateManyWithoutBookingNestedInputSchema: z.ZodType<Prisma.BookingStatusHistoryUncheckedUpdateManyWithoutBookingNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => BookingStatusHistoryCreateWithoutBookingInputSchema), z.lazy(() => BookingStatusHistoryCreateWithoutBookingInputSchema).array(), z.lazy(() => BookingStatusHistoryUncheckedCreateWithoutBookingInputSchema), z.lazy(() => BookingStatusHistoryUncheckedCreateWithoutBookingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingStatusHistoryCreateOrConnectWithoutBookingInputSchema), z.lazy(() => BookingStatusHistoryCreateOrConnectWithoutBookingInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BookingStatusHistoryUpsertWithWhereUniqueWithoutBookingInputSchema), z.lazy(() => BookingStatusHistoryUpsertWithWhereUniqueWithoutBookingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingStatusHistoryCreateManyBookingInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BookingStatusHistoryWhereUniqueInputSchema), z.lazy(() => BookingStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BookingStatusHistoryWhereUniqueInputSchema), z.lazy(() => BookingStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BookingStatusHistoryWhereUniqueInputSchema), z.lazy(() => BookingStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BookingStatusHistoryWhereUniqueInputSchema), z.lazy(() => BookingStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BookingStatusHistoryUpdateWithWhereUniqueWithoutBookingInputSchema), z.lazy(() => BookingStatusHistoryUpdateWithWhereUniqueWithoutBookingInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BookingStatusHistoryUpdateManyWithWhereWithoutBookingInputSchema), z.lazy(() => BookingStatusHistoryUpdateManyWithWhereWithoutBookingInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BookingStatusHistoryScalarWhereInputSchema), z.lazy(() => BookingStatusHistoryScalarWhereInputSchema).array() ]).optional(),
});

export default BookingStatusHistoryUncheckedUpdateManyWithoutBookingNestedInputSchema;
