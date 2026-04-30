import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';
import { BookingUpdateWithoutEventInputSchema } from './BookingUpdateWithoutEventInputSchema';
import { BookingUncheckedUpdateWithoutEventInputSchema } from './BookingUncheckedUpdateWithoutEventInputSchema';

export const BookingUpdateWithWhereUniqueWithoutEventInputSchema: z.ZodType<Prisma.BookingUpdateWithWhereUniqueWithoutEventInput> = z.object({
  where: z.lazy(() => BookingWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => BookingUpdateWithoutEventInputSchema), z.lazy(() => BookingUncheckedUpdateWithoutEventInputSchema) ]),
}).strict();

export default BookingUpdateWithWhereUniqueWithoutEventInputSchema;
