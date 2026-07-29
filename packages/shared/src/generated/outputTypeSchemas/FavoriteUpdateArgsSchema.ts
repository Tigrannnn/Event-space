import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { FavoriteIncludeSchema } from '../inputTypeSchemas/FavoriteIncludeSchema'
import { FavoriteUpdateInputSchema } from '../inputTypeSchemas/FavoriteUpdateInputSchema'
import { FavoriteUncheckedUpdateInputSchema } from '../inputTypeSchemas/FavoriteUncheckedUpdateInputSchema'
import { FavoriteWhereUniqueInputSchema } from '../inputTypeSchemas/FavoriteWhereUniqueInputSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { EventArgsSchema } from "../outputTypeSchemas/EventArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const FavoriteSelectSchema: z.ZodType<Prisma.FavoriteSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  eventId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  event: z.union([z.boolean(),z.lazy(() => EventArgsSchema)]).optional(),
}).strict()

export const FavoriteUpdateArgsSchema: z.ZodType<Prisma.FavoriteUpdateArgs> = z.object({
  select: FavoriteSelectSchema.optional(),
  include: z.lazy(() => FavoriteIncludeSchema).optional(),
  data: z.union([ FavoriteUpdateInputSchema, FavoriteUncheckedUpdateInputSchema ]),
  where: FavoriteWhereUniqueInputSchema, 
}).strict();

export default FavoriteUpdateArgsSchema;
