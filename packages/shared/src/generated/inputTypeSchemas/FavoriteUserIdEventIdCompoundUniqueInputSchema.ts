import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const FavoriteUserIdEventIdCompoundUniqueInputSchema: z.ZodType<Prisma.FavoriteUserIdEventIdCompoundUniqueInput> = z.strictObject({
  userId: z.string(),
  eventId: z.string(),
});

export default FavoriteUserIdEventIdCompoundUniqueInputSchema;
