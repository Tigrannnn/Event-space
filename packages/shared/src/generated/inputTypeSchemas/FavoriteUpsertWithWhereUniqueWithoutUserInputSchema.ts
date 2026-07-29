import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { FavoriteWhereUniqueInputSchema } from './FavoriteWhereUniqueInputSchema';
import { FavoriteUpdateWithoutUserInputSchema } from './FavoriteUpdateWithoutUserInputSchema';
import { FavoriteUncheckedUpdateWithoutUserInputSchema } from './FavoriteUncheckedUpdateWithoutUserInputSchema';
import { FavoriteCreateWithoutUserInputSchema } from './FavoriteCreateWithoutUserInputSchema';
import { FavoriteUncheckedCreateWithoutUserInputSchema } from './FavoriteUncheckedCreateWithoutUserInputSchema';

export const FavoriteUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.FavoriteUpsertWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => FavoriteWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => FavoriteUpdateWithoutUserInputSchema), z.lazy(() => FavoriteUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => FavoriteCreateWithoutUserInputSchema), z.lazy(() => FavoriteUncheckedCreateWithoutUserInputSchema) ]),
});

export default FavoriteUpsertWithWhereUniqueWithoutUserInputSchema;
