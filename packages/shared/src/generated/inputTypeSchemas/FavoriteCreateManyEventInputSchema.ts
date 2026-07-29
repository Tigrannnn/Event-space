import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const FavoriteCreateManyEventInputSchema: z.ZodType<Prisma.FavoriteCreateManyEventInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  createdAt: z.coerce.date().optional(),
});

export default FavoriteCreateManyEventInputSchema;
