import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingCreateWithoutUserInputSchema } from './BookingCreateWithoutUserInputSchema';
import { BookingUncheckedCreateWithoutUserInputSchema } from './BookingUncheckedCreateWithoutUserInputSchema';
import { BookingCreateOrConnectWithoutUserInputSchema } from './BookingCreateOrConnectWithoutUserInputSchema';
import { BookingUpsertWithWhereUniqueWithoutUserInputSchema } from './BookingUpsertWithWhereUniqueWithoutUserInputSchema';
import { BookingCreateManyUserInputEnvelopeSchema } from './BookingCreateManyUserInputEnvelopeSchema';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';
import { BookingUpdateWithWhereUniqueWithoutUserInputSchema } from './BookingUpdateWithWhereUniqueWithoutUserInputSchema';
import { BookingUpdateManyWithWhereWithoutUserInputSchema } from './BookingUpdateManyWithWhereWithoutUserInputSchema';
import { BookingScalarWhereInputSchema } from './BookingScalarWhereInputSchema';

export const BookingUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.BookingUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => BookingCreateWithoutUserInputSchema), z.lazy(() => BookingCreateWithoutUserInputSchema).array(), z.lazy(() => BookingUncheckedCreateWithoutUserInputSchema), z.lazy(() => BookingUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingCreateOrConnectWithoutUserInputSchema), z.lazy(() => BookingCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BookingUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => BookingUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BookingWhereUniqueInputSchema), z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BookingWhereUniqueInputSchema), z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BookingWhereUniqueInputSchema), z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BookingWhereUniqueInputSchema), z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BookingUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => BookingUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BookingUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => BookingUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BookingScalarWhereInputSchema), z.lazy(() => BookingScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default BookingUncheckedUpdateManyWithoutUserNestedInputSchema;
