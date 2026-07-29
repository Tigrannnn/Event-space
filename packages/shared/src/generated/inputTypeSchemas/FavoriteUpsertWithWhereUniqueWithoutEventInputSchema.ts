import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { FavoriteWhereUniqueInputSchema } from './FavoriteWhereUniqueInputSchema';
import { FavoriteUpdateWithoutEventInputSchema } from './FavoriteUpdateWithoutEventInputSchema';
import { FavoriteUncheckedUpdateWithoutEventInputSchema } from './FavoriteUncheckedUpdateWithoutEventInputSchema';
import { FavoriteCreateWithoutEventInputSchema } from './FavoriteCreateWithoutEventInputSchema';
import { FavoriteUncheckedCreateWithoutEventInputSchema } from './FavoriteUncheckedCreateWithoutEventInputSchema';

export const FavoriteUpsertWithWhereUniqueWithoutEventInputSchema: z.ZodType<Prisma.FavoriteUpsertWithWhereUniqueWithoutEventInput> = z.strictObject({
  where: z.lazy(() => FavoriteWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => FavoriteUpdateWithoutEventInputSchema), z.lazy(() => FavoriteUncheckedUpdateWithoutEventInputSchema) ]),
  create: z.union([ z.lazy(() => FavoriteCreateWithoutEventInputSchema), z.lazy(() => FavoriteUncheckedCreateWithoutEventInputSchema) ]),
});

export default FavoriteUpsertWithWhereUniqueWithoutEventInputSchema;
