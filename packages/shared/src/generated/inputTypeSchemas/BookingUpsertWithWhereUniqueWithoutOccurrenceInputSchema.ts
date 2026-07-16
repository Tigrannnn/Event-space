import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';
import { BookingUpdateWithoutOccurrenceInputSchema } from './BookingUpdateWithoutOccurrenceInputSchema';
import { BookingUncheckedUpdateWithoutOccurrenceInputSchema } from './BookingUncheckedUpdateWithoutOccurrenceInputSchema';
import { BookingCreateWithoutOccurrenceInputSchema } from './BookingCreateWithoutOccurrenceInputSchema';
import { BookingUncheckedCreateWithoutOccurrenceInputSchema } from './BookingUncheckedCreateWithoutOccurrenceInputSchema';

export const BookingUpsertWithWhereUniqueWithoutOccurrenceInputSchema: z.ZodType<Prisma.BookingUpsertWithWhereUniqueWithoutOccurrenceInput> = z.strictObject({
  where: z.lazy(() => BookingWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BookingUpdateWithoutOccurrenceInputSchema), z.lazy(() => BookingUncheckedUpdateWithoutOccurrenceInputSchema) ]),
  create: z.union([ z.lazy(() => BookingCreateWithoutOccurrenceInputSchema), z.lazy(() => BookingUncheckedCreateWithoutOccurrenceInputSchema) ]),
});

export default BookingUpsertWithWhereUniqueWithoutOccurrenceInputSchema;
