import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RefreshTokenScalarWhereInputSchema } from './RefreshTokenScalarWhereInputSchema';
import { RefreshTokenUpdateManyMutationInputSchema } from './RefreshTokenUpdateManyMutationInputSchema';
import { RefreshTokenUncheckedUpdateManyWithoutUserInputSchema } from './RefreshTokenUncheckedUpdateManyWithoutUserInputSchema';

export const RefreshTokenUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.RefreshTokenUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => RefreshTokenScalarWhereInputSchema),
  data: z.union([ z.lazy(() => RefreshTokenUpdateManyMutationInputSchema), z.lazy(() => RefreshTokenUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export default RefreshTokenUpdateManyWithWhereWithoutUserInputSchema;
