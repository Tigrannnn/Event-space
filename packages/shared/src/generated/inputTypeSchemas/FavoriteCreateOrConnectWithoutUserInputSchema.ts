import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { FavoriteWhereUniqueInputSchema } from './FavoriteWhereUniqueInputSchema';
import { FavoriteCreateWithoutUserInputSchema } from './FavoriteCreateWithoutUserInputSchema';
import { FavoriteUncheckedCreateWithoutUserInputSchema } from './FavoriteUncheckedCreateWithoutUserInputSchema';

export const FavoriteCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.FavoriteCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => FavoriteWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FavoriteCreateWithoutUserInputSchema), z.lazy(() => FavoriteUncheckedCreateWithoutUserInputSchema) ]),
});

export default FavoriteCreateOrConnectWithoutUserInputSchema;
