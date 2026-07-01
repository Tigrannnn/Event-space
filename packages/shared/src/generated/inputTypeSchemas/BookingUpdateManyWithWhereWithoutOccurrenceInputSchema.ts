import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingScalarWhereInputSchema } from './BookingScalarWhereInputSchema';
import { BookingUpdateManyMutationInputSchema } from './BookingUpdateManyMutationInputSchema';
import { BookingUncheckedUpdateManyWithoutOccurrenceInputSchema } from './BookingUncheckedUpdateManyWithoutOccurrenceInputSchema';

export const BookingUpdateManyWithWhereWithoutOccurrenceInputSchema: z.ZodType<Prisma.BookingUpdateManyWithWhereWithoutOccurrenceInput> = z.object({
  where: z.lazy(() => BookingScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BookingUpdateManyMutationInputSchema), z.lazy(() => BookingUncheckedUpdateManyWithoutOccurrenceInputSchema) ]),
}).strict();

export default BookingUpdateManyWithWhereWithoutOccurrenceInputSchema;
