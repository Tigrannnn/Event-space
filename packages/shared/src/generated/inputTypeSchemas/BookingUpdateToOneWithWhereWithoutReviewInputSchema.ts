import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingWhereInputSchema } from './BookingWhereInputSchema';
import { BookingUpdateWithoutReviewInputSchema } from './BookingUpdateWithoutReviewInputSchema';
import { BookingUncheckedUpdateWithoutReviewInputSchema } from './BookingUncheckedUpdateWithoutReviewInputSchema';

export const BookingUpdateToOneWithWhereWithoutReviewInputSchema: z.ZodType<Prisma.BookingUpdateToOneWithWhereWithoutReviewInput> = z.strictObject({
  where: z.lazy(() => BookingWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => BookingUpdateWithoutReviewInputSchema), z.lazy(() => BookingUncheckedUpdateWithoutReviewInputSchema) ]),
});

export default BookingUpdateToOneWithWhereWithoutReviewInputSchema;
