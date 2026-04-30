import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutRefreshTokensInputSchema } from './UserCreateNestedOneWithoutRefreshTokensInputSchema';

export const RefreshTokenCreateInputSchema: z.ZodType<Prisma.RefreshTokenCreateInput> = z.object({
  id: z.uuid().optional(),
  hashedToken: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutRefreshTokensInputSchema),
}).strict();

export default RefreshTokenCreateInputSchema;
