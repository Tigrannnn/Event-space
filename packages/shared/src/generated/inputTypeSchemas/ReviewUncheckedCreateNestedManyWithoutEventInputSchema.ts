import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewCreateWithoutEventInputSchema } from './ReviewCreateWithoutEventInputSchema';
import { ReviewUncheckedCreateWithoutEventInputSchema } from './ReviewUncheckedCreateWithoutEventInputSchema';
import { ReviewCreateOrConnectWithoutEventInputSchema } from './ReviewCreateOrConnectWithoutEventInputSchema';
import { ReviewCreateManyEventInputEnvelopeSchema } from './ReviewCreateManyEventInputEnvelopeSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';

export const ReviewUncheckedCreateNestedManyWithoutEventInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateNestedManyWithoutEventInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReviewCreateWithoutEventInputSchema), z.lazy(() => ReviewCreateWithoutEventInputSchema).array(), z.lazy(() => ReviewUncheckedCreateWithoutEventInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutEventInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutEventInputSchema), z.lazy(() => ReviewCreateOrConnectWithoutEventInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyEventInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
});

export default ReviewUncheckedCreateNestedManyWithoutEventInputSchema;
