import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { FavoriteCreateWithoutUserInputSchema } from './FavoriteCreateWithoutUserInputSchema';
import { FavoriteUncheckedCreateWithoutUserInputSchema } from './FavoriteUncheckedCreateWithoutUserInputSchema';
import { FavoriteCreateOrConnectWithoutUserInputSchema } from './FavoriteCreateOrConnectWithoutUserInputSchema';
import { FavoriteUpsertWithWhereUniqueWithoutUserInputSchema } from './FavoriteUpsertWithWhereUniqueWithoutUserInputSchema';
import { FavoriteCreateManyUserInputEnvelopeSchema } from './FavoriteCreateManyUserInputEnvelopeSchema';
import { FavoriteWhereUniqueInputSchema } from './FavoriteWhereUniqueInputSchema';
import { FavoriteUpdateWithWhereUniqueWithoutUserInputSchema } from './FavoriteUpdateWithWhereUniqueWithoutUserInputSchema';
import { FavoriteUpdateManyWithWhereWithoutUserInputSchema } from './FavoriteUpdateManyWithWhereWithoutUserInputSchema';
import { FavoriteScalarWhereInputSchema } from './FavoriteScalarWhereInputSchema';

export const FavoriteUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.FavoriteUncheckedUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => FavoriteCreateWithoutUserInputSchema), z.lazy(() => FavoriteCreateWithoutUserInputSchema).array(), z.lazy(() => FavoriteUncheckedCreateWithoutUserInputSchema), z.lazy(() => FavoriteUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoriteCreateOrConnectWithoutUserInputSchema), z.lazy(() => FavoriteCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FavoriteUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => FavoriteUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoriteCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema), z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema), z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema), z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema), z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FavoriteUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => FavoriteUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FavoriteUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => FavoriteUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FavoriteScalarWhereInputSchema), z.lazy(() => FavoriteScalarWhereInputSchema).array() ]).optional(),
});

export default FavoriteUncheckedUpdateManyWithoutUserNestedInputSchema;
