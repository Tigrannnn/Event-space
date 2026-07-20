import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventArgsSchema } from "../outputTypeSchemas/EventArgsSchema"
import { BookingFindManyArgsSchema } from "../outputTypeSchemas/BookingFindManyArgsSchema"
import { EventOccurrenceCountOutputTypeArgsSchema } from "../outputTypeSchemas/EventOccurrenceCountOutputTypeArgsSchema"

export const EventOccurrenceSelectSchema: z.ZodType<Prisma.EventOccurrenceSelect> = z.object({
  id: z.boolean().optional(),
  eventId: z.boolean().optional(),
  date: z.boolean().optional(),
  status: z.boolean().optional(),
  maxParticipants: z.boolean().optional(),
  currentParticipants: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  event: z.union([z.boolean(),z.lazy(() => EventArgsSchema)]).optional(),
  bookings: z.union([z.boolean(),z.lazy(() => BookingFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => EventOccurrenceCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default EventOccurrenceSelectSchema;
