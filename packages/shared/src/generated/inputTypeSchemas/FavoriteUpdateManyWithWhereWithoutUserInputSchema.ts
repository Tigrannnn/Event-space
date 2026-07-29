import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { FavoriteScalarWhereInputSchema } from './FavoriteScalarWhereInputSchema';
import { FavoriteUpdateManyMutationInputSchema } from './FavoriteUpdateManyMutationInputSchema';
import { FavoriteUncheckedUpdateManyWithoutUserInputSchema } from './FavoriteUncheckedUpdateManyWithoutUserInputSchema';

export const FavoriteUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.FavoriteUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => FavoriteScalarWhereInputSchema),
  data: z.union([ z.lazy(() => FavoriteUpdateManyMutationInputSchema), z.lazy(() => FavoriteUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export default FavoriteUpdateManyWithWhereWithoutUserInputSchema;
