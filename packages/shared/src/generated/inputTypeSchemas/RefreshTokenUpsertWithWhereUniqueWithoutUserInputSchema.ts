import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RefreshTokenWhereUniqueInputSchema } from './RefreshTokenWhereUniqueInputSchema';
import { RefreshTokenUpdateWithoutUserInputSchema } from './RefreshTokenUpdateWithoutUserInputSchema';
import { RefreshTokenUncheckedUpdateWithoutUserInputSchema } from './RefreshTokenUncheckedUpdateWithoutUserInputSchema';
import { RefreshTokenCreateWithoutUserInputSchema } from './RefreshTokenCreateWithoutUserInputSchema';
import { RefreshTokenUncheckedCreateWithoutUserInputSchema } from './RefreshTokenUncheckedCreateWithoutUserInputSchema';

export const RefreshTokenUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.RefreshTokenUpsertWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => RefreshTokenWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => RefreshTokenUpdateWithoutUserInputSchema), z.lazy(() => RefreshTokenUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => RefreshTokenCreateWithoutUserInputSchema), z.lazy(() => RefreshTokenUncheckedCreateWithoutUserInputSchema) ]),
});

export default RefreshTokenUpsertWithWhereUniqueWithoutUserInputSchema;
