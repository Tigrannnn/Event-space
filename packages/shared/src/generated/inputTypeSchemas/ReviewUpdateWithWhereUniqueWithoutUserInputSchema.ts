import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithoutUserInputSchema } from './ReviewUpdateWithoutUserInputSchema';
import { ReviewUncheckedUpdateWithoutUserInputSchema } from './ReviewUncheckedUpdateWithoutUserInputSchema';

export const ReviewUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ReviewUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateWithoutUserInputSchema), z.lazy(() => ReviewUncheckedUpdateWithoutUserInputSchema) ]),
});

export default ReviewUpdateWithWhereUniqueWithoutUserInputSchema;
