import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const FavoriteCreateManyInputSchema: z.ZodType<Prisma.FavoriteCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  eventId: z.string(),
  createdAt: z.coerce.date().optional(),
});

export default FavoriteCreateManyInputSchema;
