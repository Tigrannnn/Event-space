import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewCreateWithoutBookingInputSchema } from './ReviewCreateWithoutBookingInputSchema';
import { ReviewUncheckedCreateWithoutBookingInputSchema } from './ReviewUncheckedCreateWithoutBookingInputSchema';
import { ReviewCreateOrConnectWithoutBookingInputSchema } from './ReviewCreateOrConnectWithoutBookingInputSchema';
import { ReviewUpsertWithoutBookingInputSchema } from './ReviewUpsertWithoutBookingInputSchema';
import { ReviewWhereInputSchema } from './ReviewWhereInputSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateToOneWithWhereWithoutBookingInputSchema } from './ReviewUpdateToOneWithWhereWithoutBookingInputSchema';
import { ReviewUpdateWithoutBookingInputSchema } from './ReviewUpdateWithoutBookingInputSchema';
import { ReviewUncheckedUpdateWithoutBookingInputSchema } from './ReviewUncheckedUpdateWithoutBookingInputSchema';

export const ReviewUpdateOneWithoutBookingNestedInputSchema: z.ZodType<Prisma.ReviewUpdateOneWithoutBookingNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReviewCreateWithoutBookingInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutBookingInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ReviewCreateOrConnectWithoutBookingInputSchema).optional(),
  upsert: z.lazy(() => ReviewUpsertWithoutBookingInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ReviewWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ReviewWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ReviewWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateToOneWithWhereWithoutBookingInputSchema), z.lazy(() => ReviewUpdateWithoutBookingInputSchema), z.lazy(() => ReviewUncheckedUpdateWithoutBookingInputSchema) ]).optional(),
});

export default ReviewUpdateOneWithoutBookingNestedInputSchema;
