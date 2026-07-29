import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { FavoriteWhereUniqueInputSchema } from './FavoriteWhereUniqueInputSchema';
import { FavoriteCreateWithoutEventInputSchema } from './FavoriteCreateWithoutEventInputSchema';
import { FavoriteUncheckedCreateWithoutEventInputSchema } from './FavoriteUncheckedCreateWithoutEventInputSchema';

export const FavoriteCreateOrConnectWithoutEventInputSchema: z.ZodType<Prisma.FavoriteCreateOrConnectWithoutEventInput> = z.strictObject({
  where: z.lazy(() => FavoriteWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FavoriteCreateWithoutEventInputSchema), z.lazy(() => FavoriteUncheckedCreateWithoutEventInputSchema) ]),
});

export default FavoriteCreateOrConnectWithoutEventInputSchema;
