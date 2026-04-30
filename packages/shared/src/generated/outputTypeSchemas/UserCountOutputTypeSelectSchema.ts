import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z.object({
  events: z.boolean().optional(),
  refreshTokens: z.boolean().optional(),
}).strict();

export default UserCountOutputTypeSelectSchema;
