import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventTranslationIncludeSchema } from '../inputTypeSchemas/EventTranslationIncludeSchema'
import { EventTranslationCreateInputSchema } from '../inputTypeSchemas/EventTranslationCreateInputSchema'
import { EventTranslationUncheckedCreateInputSchema } from '../inputTypeSchemas/EventTranslationUncheckedCreateInputSchema'
import { EventArgsSchema } from "../outputTypeSchemas/EventArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const EventTranslationSelectSchema: z.ZodType<Prisma.EventTranslationSelect> = z.object({
  id: z.boolean().optional(),
  eventId: z.boolean().optional(),
  locale: z.boolean().optional(),
  title: z.boolean().optional(),
  description: z.boolean().optional(),
  location: z.boolean().optional(),
  meetingLocation: z.boolean().optional(),
  whatsIncluded: z.boolean().optional(),
  event: z.union([z.boolean(),z.lazy(() => EventArgsSchema)]).optional(),
}).strict()

export const EventTranslationCreateArgsSchema: z.ZodType<Prisma.EventTranslationCreateArgs> = z.object({
  select: EventTranslationSelectSchema.optional(),
  include: z.lazy(() => EventTranslationIncludeSchema).optional(),
  data: z.union([ EventTranslationCreateInputSchema, EventTranslationUncheckedCreateInputSchema ]),
}).strict();

export default EventTranslationCreateArgsSchema;
