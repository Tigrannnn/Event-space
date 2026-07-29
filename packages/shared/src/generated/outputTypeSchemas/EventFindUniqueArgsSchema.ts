import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventIncludeSchema } from '../inputTypeSchemas/EventIncludeSchema'
import { EventWhereUniqueInputSchema } from '../inputTypeSchemas/EventWhereUniqueInputSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { CategoryArgsSchema } from "../outputTypeSchemas/CategoryArgsSchema"
import { EventOccurrenceFindManyArgsSchema } from "../outputTypeSchemas/EventOccurrenceFindManyArgsSchema"
import { EventImageFindManyArgsSchema } from "../outputTypeSchemas/EventImageFindManyArgsSchema"
import { FavoriteFindManyArgsSchema } from "../outputTypeSchemas/FavoriteFindManyArgsSchema"
import { CancellationPolicyRuleFindManyArgsSchema } from "../outputTypeSchemas/CancellationPolicyRuleFindManyArgsSchema"
import { EventTranslationFindManyArgsSchema } from "../outputTypeSchemas/EventTranslationFindManyArgsSchema"
import { EventCountOutputTypeArgsSchema } from "../outputTypeSchemas/EventCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const EventSelectSchema: z.ZodType<Prisma.EventSelect> = z.object({
  id: z.boolean().optional(),
  locationUrl: z.boolean().optional(),
  meetingLocationUrl: z.boolean().optional(),
  difficulty: z.boolean().optional(),
  price: z.boolean().optional(),
  duration: z.boolean().optional(),
  status: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  userId: z.boolean().optional(),
  categoryId: z.boolean().optional(),
  organizer: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  category: z.union([z.boolean(),z.lazy(() => CategoryArgsSchema)]).optional(),
  occurrences: z.union([z.boolean(),z.lazy(() => EventOccurrenceFindManyArgsSchema)]).optional(),
  images: z.union([z.boolean(),z.lazy(() => EventImageFindManyArgsSchema)]).optional(),
  favorites: z.union([z.boolean(),z.lazy(() => FavoriteFindManyArgsSchema)]).optional(),
  cancellationRules: z.union([z.boolean(),z.lazy(() => CancellationPolicyRuleFindManyArgsSchema)]).optional(),
  translations: z.union([z.boolean(),z.lazy(() => EventTranslationFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => EventCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const EventFindUniqueArgsSchema: z.ZodType<Prisma.EventFindUniqueArgs> = z.object({
  select: EventSelectSchema.optional(),
  include: z.lazy(() => EventIncludeSchema).optional(),
  where: EventWhereUniqueInputSchema, 
}).strict();

export default EventFindUniqueArgsSchema;
