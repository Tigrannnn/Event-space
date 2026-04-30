import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingCreateWithoutEventInputSchema } from './BookingCreateWithoutEventInputSchema';
import { BookingUncheckedCreateWithoutEventInputSchema } from './BookingUncheckedCreateWithoutEventInputSchema';
import { BookingCreateOrConnectWithoutEventInputSchema } from './BookingCreateOrConnectWithoutEventInputSchema';
import { BookingUpsertWithWhereUniqueWithoutEventInputSchema } from './BookingUpsertWithWhereUniqueWithoutEventInputSchema';
import { BookingCreateManyEventInputEnvelopeSchema } from './BookingCreateManyEventInputEnvelopeSchema';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';
import { BookingUpdateWithWhereUniqueWithoutEventInputSchema } from './BookingUpdateWithWhereUniqueWithoutEventInputSchema';
import { BookingUpdateManyWithWhereWithoutEventInputSchema } from './BookingUpdateManyWithWhereWithoutEventInputSchema';
import { BookingScalarWhereInputSchema } from './BookingScalarWhereInputSchema';

export const BookingUncheckedUpdateManyWithoutEventNestedInputSchema: z.ZodType<Prisma.BookingUncheckedUpdateManyWithoutEventNestedInput> = z.object({
  create: z.union([ z.lazy(() => BookingCreateWithoutEventInputSchema), z.lazy(() => BookingCreateWithoutEventInputSchema).array(), z.lazy(() => BookingUncheckedCreateWithoutEventInputSchema), z.lazy(() => BookingUncheckedCreateWithoutEventInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingCreateOrConnectWithoutEventInputSchema), z.lazy(() => BookingCreateOrConnectWithoutEventInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BookingUpsertWithWhereUniqueWithoutEventInputSchema), z.lazy(() => BookingUpsertWithWhereUniqueWithoutEventInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingCreateManyEventInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BookingWhereUniqueInputSchema), z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BookingWhereUniqueInputSchema), z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BookingWhereUniqueInputSchema), z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BookingWhereUniqueInputSchema), z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BookingUpdateWithWhereUniqueWithoutEventInputSchema), z.lazy(() => BookingUpdateWithWhereUniqueWithoutEventInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BookingUpdateManyWithWhereWithoutEventInputSchema), z.lazy(() => BookingUpdateManyWithWhereWithoutEventInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BookingScalarWhereInputSchema), z.lazy(() => BookingScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default BookingUncheckedUpdateManyWithoutEventNestedInputSchema;
