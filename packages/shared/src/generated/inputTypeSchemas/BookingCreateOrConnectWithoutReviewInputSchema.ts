import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';
import { BookingCreateWithoutReviewInputSchema } from './BookingCreateWithoutReviewInputSchema';
import { BookingUncheckedCreateWithoutReviewInputSchema } from './BookingUncheckedCreateWithoutReviewInputSchema';

export const BookingCreateOrConnectWithoutReviewInputSchema: z.ZodType<Prisma.BookingCreateOrConnectWithoutReviewInput> = z.strictObject({
  where: z.lazy(() => BookingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BookingCreateWithoutReviewInputSchema), z.lazy(() => BookingUncheckedCreateWithoutReviewInputSchema) ]),
});

export default BookingCreateOrConnectWithoutReviewInputSchema;
