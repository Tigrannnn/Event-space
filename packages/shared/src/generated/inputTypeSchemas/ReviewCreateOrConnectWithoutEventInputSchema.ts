import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewCreateWithoutEventInputSchema } from './ReviewCreateWithoutEventInputSchema';
import { ReviewUncheckedCreateWithoutEventInputSchema } from './ReviewUncheckedCreateWithoutEventInputSchema';

export const ReviewCreateOrConnectWithoutEventInputSchema: z.ZodType<Prisma.ReviewCreateOrConnectWithoutEventInput> = z.strictObject({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReviewCreateWithoutEventInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutEventInputSchema) ]),
});

export default ReviewCreateOrConnectWithoutEventInputSchema;
