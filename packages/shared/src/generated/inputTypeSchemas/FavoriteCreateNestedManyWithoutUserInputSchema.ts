import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { FavoriteCreateWithoutUserInputSchema } from './FavoriteCreateWithoutUserInputSchema';
import { FavoriteUncheckedCreateWithoutUserInputSchema } from './FavoriteUncheckedCreateWithoutUserInputSchema';
import { FavoriteCreateOrConnectWithoutUserInputSchema } from './FavoriteCreateOrConnectWithoutUserInputSchema';
import { FavoriteCreateManyUserInputEnvelopeSchema } from './FavoriteCreateManyUserInputEnvelopeSchema';
import { FavoriteWhereUniqueInputSchema } from './FavoriteWhereUniqueInputSchema';

export const FavoriteCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.FavoriteCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => FavoriteCreateWithoutUserInputSchema), z.lazy(() => FavoriteCreateWithoutUserInputSchema).array(), z.lazy(() => FavoriteUncheckedCreateWithoutUserInputSchema), z.lazy(() => FavoriteUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoriteCreateOrConnectWithoutUserInputSchema), z.lazy(() => FavoriteCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoriteCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema), z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
});

export default FavoriteCreateNestedManyWithoutUserInputSchema;
