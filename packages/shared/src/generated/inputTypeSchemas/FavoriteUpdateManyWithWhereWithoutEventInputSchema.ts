import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { FavoriteScalarWhereInputSchema } from './FavoriteScalarWhereInputSchema';
import { FavoriteUpdateManyMutationInputSchema } from './FavoriteUpdateManyMutationInputSchema';
import { FavoriteUncheckedUpdateManyWithoutEventInputSchema } from './FavoriteUncheckedUpdateManyWithoutEventInputSchema';

export const FavoriteUpdateManyWithWhereWithoutEventInputSchema: z.ZodType<Prisma.FavoriteUpdateManyWithWhereWithoutEventInput> = z.strictObject({
  where: z.lazy(() => FavoriteScalarWhereInputSchema),
  data: z.union([ z.lazy(() => FavoriteUpdateManyMutationInputSchema), z.lazy(() => FavoriteUncheckedUpdateManyWithoutEventInputSchema) ]),
});

export default FavoriteUpdateManyWithWhereWithoutEventInputSchema;
