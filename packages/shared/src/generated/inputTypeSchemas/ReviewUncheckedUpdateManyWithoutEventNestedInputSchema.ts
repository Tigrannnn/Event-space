import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewCreateWithoutEventInputSchema } from './ReviewCreateWithoutEventInputSchema';
import { ReviewUncheckedCreateWithoutEventInputSchema } from './ReviewUncheckedCreateWithoutEventInputSchema';
import { ReviewCreateOrConnectWithoutEventInputSchema } from './ReviewCreateOrConnectWithoutEventInputSchema';
import { ReviewUpsertWithWhereUniqueWithoutEventInputSchema } from './ReviewUpsertWithWhereUniqueWithoutEventInputSchema';
import { ReviewCreateManyEventInputEnvelopeSchema } from './ReviewCreateManyEventInputEnvelopeSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithWhereUniqueWithoutEventInputSchema } from './ReviewUpdateWithWhereUniqueWithoutEventInputSchema';
import { ReviewUpdateManyWithWhereWithoutEventInputSchema } from './ReviewUpdateManyWithWhereWithoutEventInputSchema';
import { ReviewScalarWhereInputSchema } from './ReviewScalarWhereInputSchema';

export const ReviewUncheckedUpdateManyWithoutEventNestedInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateManyWithoutEventNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReviewCreateWithoutEventInputSchema), z.lazy(() => ReviewCreateWithoutEventInputSchema).array(), z.lazy(() => ReviewUncheckedCreateWithoutEventInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutEventInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutEventInputSchema), z.lazy(() => ReviewCreateOrConnectWithoutEventInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReviewUpsertWithWhereUniqueWithoutEventInputSchema), z.lazy(() => ReviewUpsertWithWhereUniqueWithoutEventInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyEventInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateWithWhereUniqueWithoutEventInputSchema), z.lazy(() => ReviewUpdateWithWhereUniqueWithoutEventInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReviewUpdateManyWithWhereWithoutEventInputSchema), z.lazy(() => ReviewUpdateManyWithWhereWithoutEventInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReviewScalarWhereInputSchema), z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
});

export default ReviewUncheckedUpdateManyWithoutEventNestedInputSchema;
