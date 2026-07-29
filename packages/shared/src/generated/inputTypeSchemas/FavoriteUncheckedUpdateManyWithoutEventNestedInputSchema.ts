import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { FavoriteCreateWithoutEventInputSchema } from './FavoriteCreateWithoutEventInputSchema';
import { FavoriteUncheckedCreateWithoutEventInputSchema } from './FavoriteUncheckedCreateWithoutEventInputSchema';
import { FavoriteCreateOrConnectWithoutEventInputSchema } from './FavoriteCreateOrConnectWithoutEventInputSchema';
import { FavoriteUpsertWithWhereUniqueWithoutEventInputSchema } from './FavoriteUpsertWithWhereUniqueWithoutEventInputSchema';
import { FavoriteCreateManyEventInputEnvelopeSchema } from './FavoriteCreateManyEventInputEnvelopeSchema';
import { FavoriteWhereUniqueInputSchema } from './FavoriteWhereUniqueInputSchema';
import { FavoriteUpdateWithWhereUniqueWithoutEventInputSchema } from './FavoriteUpdateWithWhereUniqueWithoutEventInputSchema';
import { FavoriteUpdateManyWithWhereWithoutEventInputSchema } from './FavoriteUpdateManyWithWhereWithoutEventInputSchema';
import { FavoriteScalarWhereInputSchema } from './FavoriteScalarWhereInputSchema';

export const FavoriteUncheckedUpdateManyWithoutEventNestedInputSchema: z.ZodType<Prisma.FavoriteUncheckedUpdateManyWithoutEventNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => FavoriteCreateWithoutEventInputSchema), z.lazy(() => FavoriteCreateWithoutEventInputSchema).array(), z.lazy(() => FavoriteUncheckedCreateWithoutEventInputSchema), z.lazy(() => FavoriteUncheckedCreateWithoutEventInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoriteCreateOrConnectWithoutEventInputSchema), z.lazy(() => FavoriteCreateOrConnectWithoutEventInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FavoriteUpsertWithWhereUniqueWithoutEventInputSchema), z.lazy(() => FavoriteUpsertWithWhereUniqueWithoutEventInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoriteCreateManyEventInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema), z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema), z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema), z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema), z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FavoriteUpdateWithWhereUniqueWithoutEventInputSchema), z.lazy(() => FavoriteUpdateWithWhereUniqueWithoutEventInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FavoriteUpdateManyWithWhereWithoutEventInputSchema), z.lazy(() => FavoriteUpdateManyWithWhereWithoutEventInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FavoriteScalarWhereInputSchema), z.lazy(() => FavoriteScalarWhereInputSchema).array() ]).optional(),
});

export default FavoriteUncheckedUpdateManyWithoutEventNestedInputSchema;
