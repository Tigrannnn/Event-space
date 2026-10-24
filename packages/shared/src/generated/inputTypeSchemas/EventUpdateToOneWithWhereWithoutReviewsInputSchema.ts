import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereInputSchema } from './EventWhereInputSchema';
import { EventUpdateWithoutReviewsInputSchema } from './EventUpdateWithoutReviewsInputSchema';
import { EventUncheckedUpdateWithoutReviewsInputSchema } from './EventUncheckedUpdateWithoutReviewsInputSchema';

export const EventUpdateToOneWithWhereWithoutReviewsInputSchema: z.ZodType<Prisma.EventUpdateToOneWithWhereWithoutReviewsInput> = z.strictObject({
  where: z.lazy(() => EventWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => EventUpdateWithoutReviewsInputSchema), z.lazy(() => EventUncheckedUpdateWithoutReviewsInputSchema) ]),
});

export default EventUpdateToOneWithWhereWithoutReviewsInputSchema;
