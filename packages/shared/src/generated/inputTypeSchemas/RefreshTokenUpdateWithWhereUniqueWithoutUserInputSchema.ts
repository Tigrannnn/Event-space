import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RefreshTokenWhereUniqueInputSchema } from './RefreshTokenWhereUniqueInputSchema';
import { RefreshTokenUpdateWithoutUserInputSchema } from './RefreshTokenUpdateWithoutUserInputSchema';
import { RefreshTokenUncheckedUpdateWithoutUserInputSchema } from './RefreshTokenUncheckedUpdateWithoutUserInputSchema';

export const RefreshTokenUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.RefreshTokenUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => RefreshTokenWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => RefreshTokenUpdateWithoutUserInputSchema), z.lazy(() => RefreshTokenUncheckedUpdateWithoutUserInputSchema) ]),
});

export default RefreshTokenUpdateWithWhereUniqueWithoutUserInputSchema;
