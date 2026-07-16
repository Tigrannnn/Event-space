import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';
import { BookingCreateWithoutOccurrenceInputSchema } from './BookingCreateWithoutOccurrenceInputSchema';
import { BookingUncheckedCreateWithoutOccurrenceInputSchema } from './BookingUncheckedCreateWithoutOccurrenceInputSchema';

export const BookingCreateOrConnectWithoutOccurrenceInputSchema: z.ZodType<Prisma.BookingCreateOrConnectWithoutOccurrenceInput> = z.strictObject({
  where: z.lazy(() => BookingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BookingCreateWithoutOccurrenceInputSchema), z.lazy(() => BookingUncheckedCreateWithoutOccurrenceInputSchema) ]),
});

export default BookingCreateOrConnectWithoutOccurrenceInputSchema;
