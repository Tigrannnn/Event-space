import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingCreateWithoutOccurrenceInputSchema } from './BookingCreateWithoutOccurrenceInputSchema';
import { BookingUncheckedCreateWithoutOccurrenceInputSchema } from './BookingUncheckedCreateWithoutOccurrenceInputSchema';
import { BookingCreateOrConnectWithoutOccurrenceInputSchema } from './BookingCreateOrConnectWithoutOccurrenceInputSchema';
import { BookingCreateManyOccurrenceInputEnvelopeSchema } from './BookingCreateManyOccurrenceInputEnvelopeSchema';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';

export const BookingCreateNestedManyWithoutOccurrenceInputSchema: z.ZodType<Prisma.BookingCreateNestedManyWithoutOccurrenceInput> = z.object({
  create: z.union([ z.lazy(() => BookingCreateWithoutOccurrenceInputSchema), z.lazy(() => BookingCreateWithoutOccurrenceInputSchema).array(), z.lazy(() => BookingUncheckedCreateWithoutOccurrenceInputSchema), z.lazy(() => BookingUncheckedCreateWithoutOccurrenceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingCreateOrConnectWithoutOccurrenceInputSchema), z.lazy(() => BookingCreateOrConnectWithoutOccurrenceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingCreateManyOccurrenceInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BookingWhereUniqueInputSchema), z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default BookingCreateNestedManyWithoutOccurrenceInputSchema;
