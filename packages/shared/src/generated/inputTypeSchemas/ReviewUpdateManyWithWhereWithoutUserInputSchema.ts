import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewScalarWhereInputSchema } from './ReviewScalarWhereInputSchema';
import { ReviewUpdateManyMutationInputSchema } from './ReviewUpdateManyMutationInputSchema';
import { ReviewUncheckedUpdateManyWithoutUserInputSchema } from './ReviewUncheckedUpdateManyWithoutUserInputSchema';

export const ReviewUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => ReviewScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateManyMutationInputSchema), z.lazy(() => ReviewUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export default ReviewUpdateManyWithWhereWithoutUserInputSchema;
