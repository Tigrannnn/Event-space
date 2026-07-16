import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';
import { BookingUpdateWithoutOccurrenceInputSchema } from './BookingUpdateWithoutOccurrenceInputSchema';
import { BookingUncheckedUpdateWithoutOccurrenceInputSchema } from './BookingUncheckedUpdateWithoutOccurrenceInputSchema';

export const BookingUpdateWithWhereUniqueWithoutOccurrenceInputSchema: z.ZodType<Prisma.BookingUpdateWithWhereUniqueWithoutOccurrenceInput> = z.strictObject({
  where: z.lazy(() => BookingWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => BookingUpdateWithoutOccurrenceInputSchema), z.lazy(() => BookingUncheckedUpdateWithoutOccurrenceInputSchema) ]),
});

export default BookingUpdateWithWhereUniqueWithoutOccurrenceInputSchema;
