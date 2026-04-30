import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventIncludeSchema } from '../inputTypeSchemas/EventIncludeSchema'
import { EventUpdateInputSchema } from '../inputTypeSchemas/EventUpdateInputSchema'
import { EventUncheckedUpdateInputSchema } from '../inputTypeSchemas/EventUncheckedUpdateInputSchema'
import { EventWhereUniqueInputSchema } from '../inputTypeSchemas/EventWhereUniqueInputSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const EventSelectSchema: z.ZodType<Prisma.EventSelect> = z.object({
  id: z.boolean().optional(),
  title: z.boolean().optional(),
  description: z.boolean().optional(),
  images: z.boolean().optional(),
  location: z.boolean().optional(),
  date: z.boolean().optional(),
  difficulty: z.boolean().optional(),
  price: z.boolean().optional(),
  maxParticipants: z.boolean().optional(),
  currentParticipants: z.boolean().optional(),
  category: z.boolean().optional(),
  whatsIncluded: z.boolean().optional(),
  duration: z.boolean().optional(),
  status: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  userId: z.boolean().optional(),
  organizer: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const EventUpdateArgsSchema: z.ZodType<Prisma.EventUpdateArgs> = z.object({
  select: EventSelectSchema.optional(),
  include: z.lazy(() => EventIncludeSchema).optional(),
  data: z.union([ EventUpdateInputSchema, EventUncheckedUpdateInputSchema ]),
  where: EventWhereUniqueInputSchema, 
}).strict();

export default EventUpdateArgsSchema;
