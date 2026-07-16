import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateWithoutCategoryInputSchema } from './EventCreateWithoutCategoryInputSchema';
import { EventUncheckedCreateWithoutCategoryInputSchema } from './EventUncheckedCreateWithoutCategoryInputSchema';
import { EventCreateOrConnectWithoutCategoryInputSchema } from './EventCreateOrConnectWithoutCategoryInputSchema';
import { EventCreateManyCategoryInputEnvelopeSchema } from './EventCreateManyCategoryInputEnvelopeSchema';
import { EventWhereUniqueInputSchema } from './EventWhereUniqueInputSchema';

export const EventCreateNestedManyWithoutCategoryInputSchema: z.ZodType<Prisma.EventCreateNestedManyWithoutCategoryInput> = z.strictObject({
  create: z.union([ z.lazy(() => EventCreateWithoutCategoryInputSchema), z.lazy(() => EventCreateWithoutCategoryInputSchema).array(), z.lazy(() => EventUncheckedCreateWithoutCategoryInputSchema), z.lazy(() => EventUncheckedCreateWithoutCategoryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EventCreateOrConnectWithoutCategoryInputSchema), z.lazy(() => EventCreateOrConnectWithoutCategoryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EventCreateManyCategoryInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EventWhereUniqueInputSchema), z.lazy(() => EventWhereUniqueInputSchema).array() ]).optional(),
});

export default EventCreateNestedManyWithoutCategoryInputSchema;
