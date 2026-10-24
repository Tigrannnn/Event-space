import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewWhereInputSchema } from './ReviewWhereInputSchema';
import { ReviewUpdateWithoutBookingInputSchema } from './ReviewUpdateWithoutBookingInputSchema';
import { ReviewUncheckedUpdateWithoutBookingInputSchema } from './ReviewUncheckedUpdateWithoutBookingInputSchema';

export const ReviewUpdateToOneWithWhereWithoutBookingInputSchema: z.ZodType<Prisma.ReviewUpdateToOneWithWhereWithoutBookingInput> = z.strictObject({
  where: z.lazy(() => ReviewWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ReviewUpdateWithoutBookingInputSchema), z.lazy(() => ReviewUncheckedUpdateWithoutBookingInputSchema) ]),
});

export default ReviewUpdateToOneWithWhereWithoutBookingInputSchema;
