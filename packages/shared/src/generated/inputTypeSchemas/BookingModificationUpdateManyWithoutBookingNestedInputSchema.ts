import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingModificationCreateWithoutBookingInputSchema } from './BookingModificationCreateWithoutBookingInputSchema';
import { BookingModificationUncheckedCreateWithoutBookingInputSchema } from './BookingModificationUncheckedCreateWithoutBookingInputSchema';
import { BookingModificationCreateOrConnectWithoutBookingInputSchema } from './BookingModificationCreateOrConnectWithoutBookingInputSchema';
import { BookingModificationUpsertWithWhereUniqueWithoutBookingInputSchema } from './BookingModificationUpsertWithWhereUniqueWithoutBookingInputSchema';
import { BookingModificationCreateManyBookingInputEnvelopeSchema } from './BookingModificationCreateManyBookingInputEnvelopeSchema';
import { BookingModificationWhereUniqueInputSchema } from './BookingModificationWhereUniqueInputSchema';
import { BookingModificationUpdateWithWhereUniqueWithoutBookingInputSchema } from './BookingModificationUpdateWithWhereUniqueWithoutBookingInputSchema';
import { BookingModificationUpdateManyWithWhereWithoutBookingInputSchema } from './BookingModificationUpdateManyWithWhereWithoutBookingInputSchema';
import { BookingModificationScalarWhereInputSchema } from './BookingModificationScalarWhereInputSchema';

export const BookingModificationUpdateManyWithoutBookingNestedInputSchema: z.ZodType<Prisma.BookingModificationUpdateManyWithoutBookingNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => BookingModificationCreateWithoutBookingInputSchema), z.lazy(() => BookingModificationCreateWithoutBookingInputSchema).array(), z.lazy(() => BookingModificationUncheckedCreateWithoutBookingInputSchema), z.lazy(() => BookingModificationUncheckedCreateWithoutBookingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingModificationCreateOrConnectWithoutBookingInputSchema), z.lazy(() => BookingModificationCreateOrConnectWithoutBookingInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BookingModificationUpsertWithWhereUniqueWithoutBookingInputSchema), z.lazy(() => BookingModificationUpsertWithWhereUniqueWithoutBookingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingModificationCreateManyBookingInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BookingModificationWhereUniqueInputSchema), z.lazy(() => BookingModificationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BookingModificationWhereUniqueInputSchema), z.lazy(() => BookingModificationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BookingModificationWhereUniqueInputSchema), z.lazy(() => BookingModificationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BookingModificationWhereUniqueInputSchema), z.lazy(() => BookingModificationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BookingModificationUpdateWithWhereUniqueWithoutBookingInputSchema), z.lazy(() => BookingModificationUpdateWithWhereUniqueWithoutBookingInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BookingModificationUpdateManyWithWhereWithoutBookingInputSchema), z.lazy(() => BookingModificationUpdateManyWithWhereWithoutBookingInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BookingModificationScalarWhereInputSchema), z.lazy(() => BookingModificationScalarWhereInputSchema).array() ]).optional(),
});

export default BookingModificationUpdateManyWithoutBookingNestedInputSchema;
