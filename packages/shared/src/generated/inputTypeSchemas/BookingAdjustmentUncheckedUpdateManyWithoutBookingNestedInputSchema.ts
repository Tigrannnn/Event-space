import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingAdjustmentCreateWithoutBookingInputSchema } from './BookingAdjustmentCreateWithoutBookingInputSchema';
import { BookingAdjustmentUncheckedCreateWithoutBookingInputSchema } from './BookingAdjustmentUncheckedCreateWithoutBookingInputSchema';
import { BookingAdjustmentCreateOrConnectWithoutBookingInputSchema } from './BookingAdjustmentCreateOrConnectWithoutBookingInputSchema';
import { BookingAdjustmentUpsertWithWhereUniqueWithoutBookingInputSchema } from './BookingAdjustmentUpsertWithWhereUniqueWithoutBookingInputSchema';
import { BookingAdjustmentCreateManyBookingInputEnvelopeSchema } from './BookingAdjustmentCreateManyBookingInputEnvelopeSchema';
import { BookingAdjustmentWhereUniqueInputSchema } from './BookingAdjustmentWhereUniqueInputSchema';
import { BookingAdjustmentUpdateWithWhereUniqueWithoutBookingInputSchema } from './BookingAdjustmentUpdateWithWhereUniqueWithoutBookingInputSchema';
import { BookingAdjustmentUpdateManyWithWhereWithoutBookingInputSchema } from './BookingAdjustmentUpdateManyWithWhereWithoutBookingInputSchema';
import { BookingAdjustmentScalarWhereInputSchema } from './BookingAdjustmentScalarWhereInputSchema';

export const BookingAdjustmentUncheckedUpdateManyWithoutBookingNestedInputSchema: z.ZodType<Prisma.BookingAdjustmentUncheckedUpdateManyWithoutBookingNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => BookingAdjustmentCreateWithoutBookingInputSchema), z.lazy(() => BookingAdjustmentCreateWithoutBookingInputSchema).array(), z.lazy(() => BookingAdjustmentUncheckedCreateWithoutBookingInputSchema), z.lazy(() => BookingAdjustmentUncheckedCreateWithoutBookingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingAdjustmentCreateOrConnectWithoutBookingInputSchema), z.lazy(() => BookingAdjustmentCreateOrConnectWithoutBookingInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BookingAdjustmentUpsertWithWhereUniqueWithoutBookingInputSchema), z.lazy(() => BookingAdjustmentUpsertWithWhereUniqueWithoutBookingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingAdjustmentCreateManyBookingInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BookingAdjustmentWhereUniqueInputSchema), z.lazy(() => BookingAdjustmentWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BookingAdjustmentWhereUniqueInputSchema), z.lazy(() => BookingAdjustmentWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BookingAdjustmentWhereUniqueInputSchema), z.lazy(() => BookingAdjustmentWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BookingAdjustmentWhereUniqueInputSchema), z.lazy(() => BookingAdjustmentWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BookingAdjustmentUpdateWithWhereUniqueWithoutBookingInputSchema), z.lazy(() => BookingAdjustmentUpdateWithWhereUniqueWithoutBookingInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BookingAdjustmentUpdateManyWithWhereWithoutBookingInputSchema), z.lazy(() => BookingAdjustmentUpdateManyWithWhereWithoutBookingInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BookingAdjustmentScalarWhereInputSchema), z.lazy(() => BookingAdjustmentScalarWhereInputSchema).array() ]).optional(),
});

export default BookingAdjustmentUncheckedUpdateManyWithoutBookingNestedInputSchema;
