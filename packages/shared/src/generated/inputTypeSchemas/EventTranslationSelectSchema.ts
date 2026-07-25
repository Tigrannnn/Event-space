import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventArgsSchema } from "../outputTypeSchemas/EventArgsSchema"

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

export default EventTranslationSelectSchema;
