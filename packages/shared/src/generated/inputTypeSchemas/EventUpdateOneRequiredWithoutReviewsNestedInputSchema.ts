import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateWithoutReviewsInputSchema } from './EventCreateWithoutReviewsInputSchema';
import { EventUncheckedCreateWithoutReviewsInputSchema } from './EventUncheckedCreateWithoutReviewsInputSchema';
import { EventCreateOrConnectWithoutReviewsInputSchema } from './EventCreateOrConnectWithoutReviewsInputSchema';
import { EventUpsertWithoutReviewsInputSchema } from './EventUpsertWithoutReviewsInputSchema';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';
import { EventUpdateToOneWithWhereWithoutReviewsInputSchema } from './EventUpdateToOneWithWhereWithoutReviewsInputSchema';
import { EventUpdateWithoutReviewsInputSchema } from './EventUpdateWithoutReviewsInputSchema';
import { EventUncheckedUpdateWithoutReviewsInputSchema } from './EventUncheckedUpdateWithoutReviewsInputSchema';

export const EventUpdateOneRequiredWithoutReviewsNestedInputSchema: z.ZodType<Prisma.EventUpdateOneRequiredWithoutReviewsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => EventCreateWithoutReviewsInputSchema), z.lazy(() => EventUncheckedCreateWithoutReviewsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EventCreateOrConnectWithoutReviewsInputSchema).optional(),
  upsert: z.lazy(() => EventUpsertWithoutReviewsInputSchema).optional(),
  connect: z.lazy(() => EventWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => EventUpdateToOneWithWhereWithoutReviewsInputSchema), z.lazy(() => EventUpdateWithoutReviewsInputSchema), z.lazy(() => EventUncheckedUpdateWithoutReviewsInputSchema) ]).optional(),
});

export default EventUpdateOneRequiredWithoutReviewsNestedInputSchema;
