import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingCreateWithoutOccurrenceInputSchema } from './BookingCreateWithoutOccurrenceInputSchema';
import { BookingUncheckedCreateWithoutOccurrenceInputSchema } from './BookingUncheckedCreateWithoutOccurrenceInputSchema';
import { BookingCreateOrConnectWithoutOccurrenceInputSchema } from './BookingCreateOrConnectWithoutOccurrenceInputSchema';
import { BookingUpsertWithWhereUniqueWithoutOccurrenceInputSchema } from './BookingUpsertWithWhereUniqueWithoutOccurrenceInputSchema';
import { BookingCreateManyOccurrenceInputEnvelopeSchema } from './BookingCreateManyOccurrenceInputEnvelopeSchema';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';
import { BookingUpdateWithWhereUniqueWithoutOccurrenceInputSchema } from './BookingUpdateWithWhereUniqueWithoutOccurrenceInputSchema';
import { BookingUpdateManyWithWhereWithoutOccurrenceInputSchema } from './BookingUpdateManyWithWhereWithoutOccurrenceInputSchema';
import { BookingScalarWhereInputSchema } from './BookingScalarWhereInputSchema';

export const BookingUpdateManyWithoutOccurrenceNestedInputSchema: z.ZodType<Prisma.BookingUpdateManyWithoutOccurrenceNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => BookingCreateWithoutOccurrenceInputSchema), z.lazy(() => BookingCreateWithoutOccurrenceInputSchema).array(), z.lazy(() => BookingUncheckedCreateWithoutOccurrenceInputSchema), z.lazy(() => BookingUncheckedCreateWithoutOccurrenceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingCreateOrConnectWithoutOccurrenceInputSchema), z.lazy(() => BookingCreateOrConnectWithoutOccurrenceInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BookingUpsertWithWhereUniqueWithoutOccurrenceInputSchema), z.lazy(() => BookingUpsertWithWhereUniqueWithoutOccurrenceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingCreateManyOccurrenceInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BookingWhereUniqueInputSchema), z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BookingWhereUniqueInputSchema), z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BookingWhereUniqueInputSchema), z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BookingWhereUniqueInputSchema), z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BookingUpdateWithWhereUniqueWithoutOccurrenceInputSchema), z.lazy(() => BookingUpdateWithWhereUniqueWithoutOccurrenceInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BookingUpdateManyWithWhereWithoutOccurrenceInputSchema), z.lazy(() => BookingUpdateManyWithWhereWithoutOccurrenceInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BookingScalarWhereInputSchema), z.lazy(() => BookingScalarWhereInputSchema).array() ]).optional(),
});

export default BookingUpdateManyWithoutOccurrenceNestedInputSchema;
