import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventTranslationIncludeSchema } from '../inputTypeSchemas/EventTranslationIncludeSchema'
import { EventTranslationUpdateInputSchema } from '../inputTypeSchemas/EventTranslationUpdateInputSchema'
import { EventTranslationUncheckedUpdateInputSchema } from '../inputTypeSchemas/EventTranslationUncheckedUpdateInputSchema'
import { EventTranslationWhereUniqueInputSchema } from '../inputTypeSchemas/EventTranslationWhereUniqueInputSchema'
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
  category: z.boolean().optional(),
  whatsIncluded: z.boolean().optional(),
  event: z.union([z.boolean(),z.lazy(() => EventArgsSchema)]).optional(),
}).strict()

export const EventTranslationUpdateArgsSchema: z.ZodType<Prisma.EventTranslationUpdateArgs> = z.object({
  select: EventTranslationSelectSchema.optional(),
  include: z.lazy(() => EventTranslationIncludeSchema).optional(),
  data: z.union([ EventTranslationUpdateInputSchema, EventTranslationUncheckedUpdateInputSchema ]),
  where: EventTranslationWhereUniqueInputSchema, 
}).strict();

export default EventTranslationUpdateArgsSchema;
