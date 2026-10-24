import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewStatusSchema } from './ReviewStatusSchema';

export const EnumReviewStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumReviewStatusFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => ReviewStatusSchema).optional(),
});

export default EnumReviewStatusFieldUpdateOperationsInputSchema;
