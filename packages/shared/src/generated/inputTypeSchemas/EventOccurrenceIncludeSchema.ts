import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventArgsSchema } from "../outputTypeSchemas/EventArgsSchema"
import { BookingFindManyArgsSchema } from "../outputTypeSchemas/BookingFindManyArgsSchema"
import { EventOccurrenceCountOutputTypeArgsSchema } from "../outputTypeSchemas/EventOccurrenceCountOutputTypeArgsSchema"

export const EventOccurrenceIncludeSchema: z.ZodType<Prisma.EventOccurrenceInclude> = z.object({
  event: z.union([z.boolean(),z.lazy(() => EventArgsSchema)]).optional(),
  bookings: z.union([z.boolean(),z.lazy(() => BookingFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => EventOccurrenceCountOutputTypeArgsSchema)]).optional(),
}).strict();

export default EventOccurrenceIncludeSchema;
