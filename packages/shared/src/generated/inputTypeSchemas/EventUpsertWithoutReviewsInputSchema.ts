import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventUpdateWithoutReviewsInputSchema } from './EventUpdateWithoutReviewsInputSchema';
import { EventUncheckedUpdateWithoutReviewsInputSchema } from './EventUncheckedUpdateWithoutReviewsInputSchema';
import { EventCreateWithoutReviewsInputSchema } from './EventCreateWithoutReviewsInputSchema';
import { EventUncheckedCreateWithoutReviewsInputSchema } from './EventUncheckedCreateWithoutReviewsInputSchema';
import { EventWhereInputSchema } from './EventWhereInputSchema';

export const EventUpsertWithoutReviewsInputSchema: z.ZodType<Prisma.EventUpsertWithoutReviewsInput> = z.strictObject({
  update: z.union([ z.lazy(() => EventUpdateWithoutReviewsInputSchema), z.lazy(() => EventUncheckedUpdateWithoutReviewsInputSchema) ]),
  create: z.union([ z.lazy(() => EventCreateWithoutReviewsInputSchema), z.lazy(() => EventUncheckedCreateWithoutReviewsInputSchema) ]),
  where: z.lazy(() => EventWhereInputSchema).optional(),
});

export default EventUpsertWithoutReviewsInputSchema;
