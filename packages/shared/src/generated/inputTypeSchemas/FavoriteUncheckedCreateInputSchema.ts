import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const FavoriteUncheckedCreateInputSchema: z.ZodType<Prisma.FavoriteUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  eventId: z.string(),
  createdAt: z.coerce.date().optional(),
});

export default FavoriteUncheckedCreateInputSchema;
