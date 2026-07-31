import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { EventOccurrenceArgsSchema } from "../outputTypeSchemas/EventOccurrenceArgsSchema"
import { BookingAdjustmentFindManyArgsSchema } from "../outputTypeSchemas/BookingAdjustmentFindManyArgsSchema"
import { BookingCountOutputTypeArgsSchema } from "../outputTypeSchemas/BookingCountOutputTypeArgsSchema"

export const BookingSelectSchema: z.ZodType<Prisma.BookingSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  occurrenceId: z.boolean().optional(),
  status: z.boolean().optional(),
  expired: z.boolean().optional(),
  quantity: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  amount: z.boolean().optional(),
  paymentMethod: z.boolean().optional(),
  createdByAdminId: z.boolean().optional(),
  paymentIntentId: z.boolean().optional(),
  referenceNumber: z.boolean().optional(),
  checkedInAt: z.boolean().optional(),
  confirmationSentAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  occurrence: z.union([z.boolean(),z.lazy(() => EventOccurrenceArgsSchema)]).optional(),
  adjustments: z.union([z.boolean(),z.lazy(() => BookingAdjustmentFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => BookingCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default BookingSelectSchema;
