import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const FavoriteUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.FavoriteUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  eventId: z.string(),
  createdAt: z.coerce.date().optional(),
});

export default FavoriteUncheckedCreateWithoutUserInputSchema;
