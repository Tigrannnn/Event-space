import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingCreateWithoutReviewInputSchema } from './BookingCreateWithoutReviewInputSchema';
import { BookingUncheckedCreateWithoutReviewInputSchema } from './BookingUncheckedCreateWithoutReviewInputSchema';
import { BookingCreateOrConnectWithoutReviewInputSchema } from './BookingCreateOrConnectWithoutReviewInputSchema';
import { BookingUpsertWithoutReviewInputSchema } from './BookingUpsertWithoutReviewInputSchema';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';
import { BookingUpdateToOneWithWhereWithoutReviewInputSchema } from './BookingUpdateToOneWithWhereWithoutReviewInputSchema';
import { BookingUpdateWithoutReviewInputSchema } from './BookingUpdateWithoutReviewInputSchema';
import { BookingUncheckedUpdateWithoutReviewInputSchema } from './BookingUncheckedUpdateWithoutReviewInputSchema';

export const BookingUpdateOneRequiredWithoutReviewNestedInputSchema: z.ZodType<Prisma.BookingUpdateOneRequiredWithoutReviewNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => BookingCreateWithoutReviewInputSchema), z.lazy(() => BookingUncheckedCreateWithoutReviewInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => BookingCreateOrConnectWithoutReviewInputSchema).optional(),
  upsert: z.lazy(() => BookingUpsertWithoutReviewInputSchema).optional(),
  connect: z.lazy(() => BookingWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => BookingUpdateToOneWithWhereWithoutReviewInputSchema), z.lazy(() => BookingUpdateWithoutReviewInputSchema), z.lazy(() => BookingUncheckedUpdateWithoutReviewInputSchema) ]).optional(),
});

export default BookingUpdateOneRequiredWithoutReviewNestedInputSchema;
