import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventTranslationIncludeSchema } from '../inputTypeSchemas/EventTranslationIncludeSchema'
import { EventTranslationWhereInputSchema } from '../inputTypeSchemas/EventTranslationWhereInputSchema'
import { EventTranslationOrderByWithRelationInputSchema } from '../inputTypeSchemas/EventTranslationOrderByWithRelationInputSchema'
import { EventTranslationWhereUniqueInputSchema } from '../inputTypeSchemas/EventTranslationWhereUniqueInputSchema'
import { EventTranslationScalarFieldEnumSchema } from '../inputTypeSchemas/EventTranslationScalarFieldEnumSchema'
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

export const EventTranslationFindFirstOrThrowArgsSchema: z.ZodType<Prisma.EventTranslationFindFirstOrThrowArgs> = z.object({
  select: EventTranslationSelectSchema.optional(),
  include: z.lazy(() => EventTranslationIncludeSchema).optional(),
  where: EventTranslationWhereInputSchema.optional(), 
  orderBy: z.union([ EventTranslationOrderByWithRelationInputSchema.array(), EventTranslationOrderByWithRelationInputSchema ]).optional(),
  cursor: EventTranslationWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EventTranslationScalarFieldEnumSchema, EventTranslationScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export default EventTranslationFindFirstOrThrowArgsSchema;
