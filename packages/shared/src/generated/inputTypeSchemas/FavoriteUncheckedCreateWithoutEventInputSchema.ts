import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const FavoriteUncheckedCreateWithoutEventInputSchema: z.ZodType<Prisma.FavoriteUncheckedCreateWithoutEventInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  createdAt: z.coerce.date().optional(),
});

export default FavoriteUncheckedCreateWithoutEventInputSchema;
