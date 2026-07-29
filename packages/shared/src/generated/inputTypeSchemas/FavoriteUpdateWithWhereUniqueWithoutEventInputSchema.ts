import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { FavoriteWhereUniqueInputSchema } from './FavoriteWhereUniqueInputSchema';
import { FavoriteUpdateWithoutEventInputSchema } from './FavoriteUpdateWithoutEventInputSchema';
import { FavoriteUncheckedUpdateWithoutEventInputSchema } from './FavoriteUncheckedUpdateWithoutEventInputSchema';

export const FavoriteUpdateWithWhereUniqueWithoutEventInputSchema: z.ZodType<Prisma.FavoriteUpdateWithWhereUniqueWithoutEventInput> = z.strictObject({
  where: z.lazy(() => FavoriteWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => FavoriteUpdateWithoutEventInputSchema), z.lazy(() => FavoriteUncheckedUpdateWithoutEventInputSchema) ]),
});

export default FavoriteUpdateWithWhereUniqueWithoutEventInputSchema;
