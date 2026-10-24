import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewCreateWithoutBookingInputSchema } from './ReviewCreateWithoutBookingInputSchema';
import { ReviewUncheckedCreateWithoutBookingInputSchema } from './ReviewUncheckedCreateWithoutBookingInputSchema';
import { ReviewCreateOrConnectWithoutBookingInputSchema } from './ReviewCreateOrConnectWithoutBookingInputSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';

export const ReviewCreateNestedOneWithoutBookingInputSchema: z.ZodType<Prisma.ReviewCreateNestedOneWithoutBookingInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReviewCreateWithoutBookingInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutBookingInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ReviewCreateOrConnectWithoutBookingInputSchema).optional(),
  connect: z.lazy(() => ReviewWhereUniqueInputSchema).optional(),
});

export default ReviewCreateNestedOneWithoutBookingInputSchema;
