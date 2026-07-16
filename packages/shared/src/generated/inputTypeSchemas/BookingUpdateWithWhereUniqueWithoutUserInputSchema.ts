import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';
import { BookingUpdateWithoutUserInputSchema } from './BookingUpdateWithoutUserInputSchema';
import { BookingUncheckedUpdateWithoutUserInputSchema } from './BookingUncheckedUpdateWithoutUserInputSchema';

export const BookingUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.BookingUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => BookingWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => BookingUpdateWithoutUserInputSchema), z.lazy(() => BookingUncheckedUpdateWithoutUserInputSchema) ]),
});

export default BookingUpdateWithWhereUniqueWithoutUserInputSchema;
