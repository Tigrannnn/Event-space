import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { BookingFindManyArgsSchema } from "../outputTypeSchemas/BookingFindManyArgsSchema"
import { EventCountOutputTypeArgsSchema } from "../outputTypeSchemas/EventCountOutputTypeArgsSchema"

export const EventIncludeSchema: z.ZodType<Prisma.EventInclude> = z.object({
  organizer: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  bookings: z.union([z.boolean(),z.lazy(() => BookingFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => EventCountOutputTypeArgsSchema)]).optional(),
}).strict();

export default EventIncludeSchema;
