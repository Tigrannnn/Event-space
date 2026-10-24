import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewUpdateWithoutBookingInputSchema } from './ReviewUpdateWithoutBookingInputSchema';
import { ReviewUncheckedUpdateWithoutBookingInputSchema } from './ReviewUncheckedUpdateWithoutBookingInputSchema';
import { ReviewCreateWithoutBookingInputSchema } from './ReviewCreateWithoutBookingInputSchema';
import { ReviewUncheckedCreateWithoutBookingInputSchema } from './ReviewUncheckedCreateWithoutBookingInputSchema';
import { ReviewWhereInputSchema } from './ReviewWhereInputSchema';

export const ReviewUpsertWithoutBookingInputSchema: z.ZodType<Prisma.ReviewUpsertWithoutBookingInput> = z.strictObject({
  update: z.union([ z.lazy(() => ReviewUpdateWithoutBookingInputSchema), z.lazy(() => ReviewUncheckedUpdateWithoutBookingInputSchema) ]),
  create: z.union([ z.lazy(() => ReviewCreateWithoutBookingInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutBookingInputSchema) ]),
  where: z.lazy(() => ReviewWhereInputSchema).optional(),
});

export default ReviewUpsertWithoutBookingInputSchema;
