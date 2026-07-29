import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { FavoriteWhereUniqueInputSchema } from './FavoriteWhereUniqueInputSchema';
import { FavoriteUpdateWithoutUserInputSchema } from './FavoriteUpdateWithoutUserInputSchema';
import { FavoriteUncheckedUpdateWithoutUserInputSchema } from './FavoriteUncheckedUpdateWithoutUserInputSchema';

export const FavoriteUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.FavoriteUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => FavoriteWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => FavoriteUpdateWithoutUserInputSchema), z.lazy(() => FavoriteUncheckedUpdateWithoutUserInputSchema) ]),
});

export default FavoriteUpdateWithWhereUniqueWithoutUserInputSchema;
