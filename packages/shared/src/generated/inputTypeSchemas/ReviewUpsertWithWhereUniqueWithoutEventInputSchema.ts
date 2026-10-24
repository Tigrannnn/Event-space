import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithoutEventInputSchema } from './ReviewUpdateWithoutEventInputSchema';
import { ReviewUncheckedUpdateWithoutEventInputSchema } from './ReviewUncheckedUpdateWithoutEventInputSchema';
import { ReviewCreateWithoutEventInputSchema } from './ReviewCreateWithoutEventInputSchema';
import { ReviewUncheckedCreateWithoutEventInputSchema } from './ReviewUncheckedCreateWithoutEventInputSchema';

export const ReviewUpsertWithWhereUniqueWithoutEventInputSchema: z.ZodType<Prisma.ReviewUpsertWithWhereUniqueWithoutEventInput> = z.strictObject({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ReviewUpdateWithoutEventInputSchema), z.lazy(() => ReviewUncheckedUpdateWithoutEventInputSchema) ]),
  create: z.union([ z.lazy(() => ReviewCreateWithoutEventInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutEventInputSchema) ]),
});

export default ReviewUpsertWithWhereUniqueWithoutEventInputSchema;
