import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingUpdateWithoutReviewInputSchema } from './BookingUpdateWithoutReviewInputSchema';
import { BookingUncheckedUpdateWithoutReviewInputSchema } from './BookingUncheckedUpdateWithoutReviewInputSchema';
import { BookingCreateWithoutReviewInputSchema } from './BookingCreateWithoutReviewInputSchema';
import { BookingUncheckedCreateWithoutReviewInputSchema } from './BookingUncheckedCreateWithoutReviewInputSchema';
import { BookingWhereInputSchema } from './BookingWhereInputSchema';

export const BookingUpsertWithoutReviewInputSchema: z.ZodType<Prisma.BookingUpsertWithoutReviewInput> = z.strictObject({
  update: z.union([ z.lazy(() => BookingUpdateWithoutReviewInputSchema), z.lazy(() => BookingUncheckedUpdateWithoutReviewInputSchema) ]),
  create: z.union([ z.lazy(() => BookingCreateWithoutReviewInputSchema), z.lazy(() => BookingUncheckedCreateWithoutReviewInputSchema) ]),
  where: z.lazy(() => BookingWhereInputSchema).optional(),
});

export default BookingUpsertWithoutReviewInputSchema;
