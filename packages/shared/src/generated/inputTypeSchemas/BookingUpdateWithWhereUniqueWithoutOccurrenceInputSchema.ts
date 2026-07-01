import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';
import { BookingUpdateWithoutOccurrenceInputSchema } from './BookingUpdateWithoutOccurrenceInputSchema';
import { BookingUncheckedUpdateWithoutOccurrenceInputSchema } from './BookingUncheckedUpdateWithoutOccurrenceInputSchema';

export const BookingUpdateWithWhereUniqueWithoutOccurrenceInputSchema: z.ZodType<Prisma.BookingUpdateWithWhereUniqueWithoutOccurrenceInput> = z.object({
  where: z.lazy(() => BookingWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => BookingUpdateWithoutOccurrenceInputSchema), z.lazy(() => BookingUncheckedUpdateWithoutOccurrenceInputSchema) ]),
}).strict();

export default BookingUpdateWithWhereUniqueWithoutOccurrenceInputSchema;
