import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateWithoutReviewsInputSchema } from './EventCreateWithoutReviewsInputSchema';
import { EventUncheckedCreateWithoutReviewsInputSchema } from './EventUncheckedCreateWithoutReviewsInputSchema';
import { EventCreateOrConnectWithoutReviewsInputSchema } from './EventCreateOrConnectWithoutReviewsInputSchema';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';

export const EventCreateNestedOneWithoutReviewsInputSchema: z.ZodType<Prisma.EventCreateNestedOneWithoutReviewsInput> = z.strictObject({
  create: z.union([ z.lazy(() => EventCreateWithoutReviewsInputSchema), z.lazy(() => EventUncheckedCreateWithoutReviewsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EventCreateOrConnectWithoutReviewsInputSchema).optional(),
  connect: z.lazy(() => EventWhereUniqueInputSchema).optional(),
});

export default EventCreateNestedOneWithoutReviewsInputSchema;
