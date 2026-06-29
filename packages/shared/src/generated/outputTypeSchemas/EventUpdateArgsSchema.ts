import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventIncludeSchema } from '../inputTypeSchemas/EventIncludeSchema'
import { EventUpdateInputSchema } from '../inputTypeSchemas/EventUpdateInputSchema'
import { EventUncheckedUpdateInputSchema } from '../inputTypeSchemas/EventUncheckedUpdateInputSchema'
import { EventWhereUniqueInputSchema } from '../inputTypeSchemas/EventWhereUniqueInputSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { CategoryArgsSchema } from "../outputTypeSchemas/CategoryArgsSchema"
import { BookingFindManyArgsSchema } from "../outputTypeSchemas/BookingFindManyArgsSchema"
import { EventImageFindManyArgsSchema } from "../outputTypeSchemas/EventImageFindManyArgsSchema"
import { CancellationPolicyRuleFindManyArgsSchema } from "../outputTypeSchemas/CancellationPolicyRuleFindManyArgsSchema"
import { EventTranslationFindManyArgsSchema } from "../outputTypeSchemas/EventTranslationFindManyArgsSchema"
import { EventCountOutputTypeArgsSchema } from "../outputTypeSchemas/EventCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const EventSelectSchema: z.ZodType<Prisma.EventSelect> = z.object({
  id: z.boolean().optional(),
  locationUrl: z.boolean().optional(),
  date: z.boolean().optional(),
  difficulty: z.boolean().optional(),
  price: z.boolean().optional(),
  maxParticipants: z.boolean().optional(),
  currentParticipants: z.boolean().optional(),
  duration: z.boolean().optional(),
  status: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  userId: z.boolean().optional(),
  categoryId: z.boolean().optional(),
  organizer: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  category: z.union([z.boolean(),z.lazy(() => CategoryArgsSchema)]).optional(),
  bookings: z.union([z.boolean(),z.lazy(() => BookingFindManyArgsSchema)]).optional(),
  images: z.union([z.boolean(),z.lazy(() => EventImageFindManyArgsSchema)]).optional(),
  cancellationRules: z.union([z.boolean(),z.lazy(() => CancellationPolicyRuleFindManyArgsSchema)]).optional(),
  translations: z.union([z.boolean(),z.lazy(() => EventTranslationFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => EventCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const EventUpdateArgsSchema: z.ZodType<Prisma.EventUpdateArgs> = z.object({
  select: EventSelectSchema.optional(),
  include: z.lazy(() => EventIncludeSchema).optional(),
  data: z.union([ EventUpdateInputSchema, EventUncheckedUpdateInputSchema ]),
  where: EventWhereUniqueInputSchema, 
}).strict();

export default EventUpdateArgsSchema;
