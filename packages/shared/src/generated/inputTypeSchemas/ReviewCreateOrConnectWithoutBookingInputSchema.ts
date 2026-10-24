import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewCreateWithoutBookingInputSchema } from './ReviewCreateWithoutBookingInputSchema';
import { ReviewUncheckedCreateWithoutBookingInputSchema } from './ReviewUncheckedCreateWithoutBookingInputSchema';

export const ReviewCreateOrConnectWithoutBookingInputSchema: z.ZodType<Prisma.ReviewCreateOrConnectWithoutBookingInput> = z.strictObject({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReviewCreateWithoutBookingInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutBookingInputSchema) ]),
});

export default ReviewCreateOrConnectWithoutBookingInputSchema;
