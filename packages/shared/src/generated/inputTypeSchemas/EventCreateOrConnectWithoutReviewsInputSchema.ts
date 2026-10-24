import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventCreateWithoutReviewsInputSchema } from './EventCreateWithoutReviewsInputSchema';
import { EventUncheckedCreateWithoutReviewsInputSchema } from './EventUncheckedCreateWithoutReviewsInputSchema';

export const EventCreateOrConnectWithoutReviewsInputSchema: z.ZodType<Prisma.EventCreateOrConnectWithoutReviewsInput> = z.strictObject({
  where: z.lazy(() => EventWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EventCreateWithoutReviewsInputSchema), z.lazy(() => EventUncheckedCreateWithoutReviewsInputSchema) ]),
});

export default EventCreateOrConnectWithoutReviewsInputSchema;
