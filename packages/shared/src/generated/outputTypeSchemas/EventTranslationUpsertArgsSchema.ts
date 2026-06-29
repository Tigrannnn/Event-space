import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventTranslationIncludeSchema } from '../inputTypeSchemas/EventTranslationIncludeSchema'
import { EventTranslationWhereUniqueInputSchema } from '../inputTypeSchemas/EventTranslationWhereUniqueInputSchema'
import { EventTranslationCreateInputSchema } from '../inputTypeSchemas/EventTranslationCreateInputSchema'
import { EventTranslationUncheckedCreateInputSchema } from '../inputTypeSchemas/EventTranslationUncheckedCreateInputSchema'
import { EventTranslationUpdateInputSchema } from '../inputTypeSchemas/EventTranslationUpdateInputSchema'
import { EventTranslationUncheckedUpdateInputSchema } from '../inputTypeSchemas/EventTranslationUncheckedUpdateInputSchema'
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
  whatsIncluded: z.boolean().optional(),
  event: z.union([z.boolean(),z.lazy(() => EventArgsSchema)]).optional(),
}).strict()

export const EventTranslationUpsertArgsSchema: z.ZodType<Prisma.EventTranslationUpsertArgs> = z.object({
  select: EventTranslationSelectSchema.optional(),
  include: z.lazy(() => EventTranslationIncludeSchema).optional(),
  where: EventTranslationWhereUniqueInputSchema, 
  create: z.union([ EventTranslationCreateInputSchema, EventTranslationUncheckedCreateInputSchema ]),
  update: z.union([ EventTranslationUpdateInputSchema, EventTranslationUncheckedUpdateInputSchema ]),
}).strict();

export default EventTranslationUpsertArgsSchema;
