import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RefreshTokenWhereUniqueInputSchema } from './RefreshTokenWhereUniqueInputSchema';
import { RefreshTokenCreateWithoutUserInputSchema } from './RefreshTokenCreateWithoutUserInputSchema';
import { RefreshTokenUncheckedCreateWithoutUserInputSchema } from './RefreshTokenUncheckedCreateWithoutUserInputSchema';

export const RefreshTokenCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.RefreshTokenCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => RefreshTokenWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RefreshTokenCreateWithoutUserInputSchema), z.lazy(() => RefreshTokenUncheckedCreateWithoutUserInputSchema) ]),
});

export default RefreshTokenCreateOrConnectWithoutUserInputSchema;
