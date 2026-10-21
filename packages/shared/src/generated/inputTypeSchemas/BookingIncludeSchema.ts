import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { EventOccurrenceArgsSchema } from "../outputTypeSchemas/EventOccurrenceArgsSchema"
import { BookingAdjustmentFindManyArgsSchema } from "../outputTypeSchemas/BookingAdjustmentFindManyArgsSchema"
import { BookingStatusHistoryFindManyArgsSchema } from "../outputTypeSchemas/BookingStatusHistoryFindManyArgsSchema"
import { BookingCountOutputTypeArgsSchema } from "../outputTypeSchemas/BookingCountOutputTypeArgsSchema"

export const BookingIncludeSchema: z.ZodType<Prisma.BookingInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  occurrence: z.union([z.boolean(),z.lazy(() => EventOccurrenceArgsSchema)]).optional(),
  adjustments: z.union([z.boolean(),z.lazy(() => BookingAdjustmentFindManyArgsSchema)]).optional(),
  statusHistory: z.union([z.boolean(),z.lazy(() => BookingStatusHistoryFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => BookingCountOutputTypeArgsSchema)]).optional(),
}).strict();

export default BookingIncludeSchema;
