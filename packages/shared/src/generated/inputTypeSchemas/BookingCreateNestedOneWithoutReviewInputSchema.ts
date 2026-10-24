import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingCreateWithoutReviewInputSchema } from './BookingCreateWithoutReviewInputSchema';
import { BookingUncheckedCreateWithoutReviewInputSchema } from './BookingUncheckedCreateWithoutReviewInputSchema';
import { BookingCreateOrConnectWithoutReviewInputSchema } from './BookingCreateOrConnectWithoutReviewInputSchema';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';

export const BookingCreateNestedOneWithoutReviewInputSchema: z.ZodType<Prisma.BookingCreateNestedOneWithoutReviewInput> = z.strictObject({
  create: z.union([ z.lazy(() => BookingCreateWithoutReviewInputSchema), z.lazy(() => BookingUncheckedCreateWithoutReviewInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => BookingCreateOrConnectWithoutReviewInputSchema).optional(),
  connect: z.lazy(() => BookingWhereUniqueInputSchema).optional(),
});

export default BookingCreateNestedOneWithoutReviewInputSchema;
