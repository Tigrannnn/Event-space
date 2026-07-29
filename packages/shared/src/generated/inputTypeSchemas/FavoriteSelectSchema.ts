import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { EventArgsSchema } from "../outputTypeSchemas/EventArgsSchema"

export const FavoriteSelectSchema: z.ZodType<Prisma.FavoriteSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  eventId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  event: z.union([z.boolean(),z.lazy(() => EventArgsSchema)]).optional(),
}).strict()

export default FavoriteSelectSchema;
