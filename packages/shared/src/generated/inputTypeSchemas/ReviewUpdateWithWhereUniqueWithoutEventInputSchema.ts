import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithoutEventInputSchema } from './ReviewUpdateWithoutEventInputSchema';
import { ReviewUncheckedUpdateWithoutEventInputSchema } from './ReviewUncheckedUpdateWithoutEventInputSchema';

export const ReviewUpdateWithWhereUniqueWithoutEventInputSchema: z.ZodType<Prisma.ReviewUpdateWithWhereUniqueWithoutEventInput> = z.strictObject({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateWithoutEventInputSchema), z.lazy(() => ReviewUncheckedUpdateWithoutEventInputSchema) ]),
});

export default ReviewUpdateWithWhereUniqueWithoutEventInputSchema;
