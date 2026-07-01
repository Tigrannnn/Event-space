import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventOccurrenceIncludeSchema } from '../inputTypeSchemas/EventOccurrenceIncludeSchema'
import { EventOccurrenceWhereInputSchema } from '../inputTypeSchemas/EventOccurrenceWhereInputSchema'
import { EventOccurrenceOrderByWithRelationInputSchema } from '../inputTypeSchemas/EventOccurrenceOrderByWithRelationInputSchema'
import { EventOccurrenceWhereUniqueInputSchema } from '../inputTypeSchemas/EventOccurrenceWhereUniqueInputSchema'
import { EventOccurrenceScalarFieldEnumSchema } from '../inputTypeSchemas/EventOccurrenceScalarFieldEnumSchema'
import { EventArgsSchema } from "../outputTypeSchemas/EventArgsSchema"
import { BookingFindManyArgsSchema } from "../outputTypeSchemas/BookingFindManyArgsSchema"
import { EventOccurrenceCountOutputTypeArgsSchema } from "../outputTypeSchemas/EventOccurrenceCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const EventOccurrenceSelectSchema: z.ZodType<Prisma.EventOccurrenceSelect> = z.object({
  id: z.boolean().optional(),
  eventId: z.boolean().optional(),
  date: z.boolean().optional(),
  maxParticipants: z.boolean().optional(),
  currentParticipants: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  event: z.union([z.boolean(),z.lazy(() => EventArgsSchema)]).optional(),
  bookings: z.union([z.boolean(),z.lazy(() => BookingFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => EventOccurrenceCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const EventOccurrenceFindFirstOrThrowArgsSchema: z.ZodType<Prisma.EventOccurrenceFindFirstOrThrowArgs> = z.object({
  select: EventOccurrenceSelectSchema.optional(),
  include: z.lazy(() => EventOccurrenceIncludeSchema).optional(),
  where: EventOccurrenceWhereInputSchema.optional(), 
  orderBy: z.union([ EventOccurrenceOrderByWithRelationInputSchema.array(), EventOccurrenceOrderByWithRelationInputSchema ]).optional(),
  cursor: EventOccurrenceWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EventOccurrenceScalarFieldEnumSchema, EventOccurrenceScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export default EventOccurrenceFindFirstOrThrowArgsSchema;
