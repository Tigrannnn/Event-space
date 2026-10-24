import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewScalarWhereInputSchema } from './ReviewScalarWhereInputSchema';
import { ReviewUpdateManyMutationInputSchema } from './ReviewUpdateManyMutationInputSchema';
import { ReviewUncheckedUpdateManyWithoutEventInputSchema } from './ReviewUncheckedUpdateManyWithoutEventInputSchema';

export const ReviewUpdateManyWithWhereWithoutEventInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithWhereWithoutEventInput> = z.strictObject({
  where: z.lazy(() => ReviewScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateManyMutationInputSchema), z.lazy(() => ReviewUncheckedUpdateManyWithoutEventInputSchema) ]),
});

export default ReviewUpdateManyWithWhereWithoutEventInputSchema;
