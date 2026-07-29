import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const FavoriteCreateManyUserInputSchema: z.ZodType<Prisma.FavoriteCreateManyUserInput> = z.strictObject({
  id: z.uuid().optional(),
  eventId: z.string(),
  createdAt: z.coerce.date().optional(),
});

export default FavoriteCreateManyUserInputSchema;
