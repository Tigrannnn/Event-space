import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const RefreshTokenCreateWithoutUserInputSchema: z.ZodType<Prisma.RefreshTokenCreateWithoutUserInput> = z.object({
  id: z.uuid().optional(),
  hashedToken: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}).strict();

export default RefreshTokenCreateWithoutUserInputSchema;
