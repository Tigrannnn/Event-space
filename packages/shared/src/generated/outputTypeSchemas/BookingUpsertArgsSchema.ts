import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingIncludeSchema } from '../inputTypeSchemas/BookingIncludeSchema'
import { BookingWhereUniqueInputSchema } from '../inputTypeSchemas/BookingWhereUniqueInputSchema'
import { BookingCreateInputSchema } from '../inputTypeSchemas/BookingCreateInputSchema'
import { BookingUncheckedCreateInputSchema } from '../inputTypeSchemas/BookingUncheckedCreateInputSchema'
import { BookingUpdateInputSchema } from '../inputTypeSchemas/BookingUpdateInputSchema'
import { BookingUncheckedUpdateInputSchema } from '../inputTypeSchemas/BookingUncheckedUpdateInputSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { EventOccurrenceArgsSchema } from "../outputTypeSchemas/EventOccurrenceArgsSchema"
import { BookingAdjustmentFindManyArgsSchema } from "../outputTypeSchemas/BookingAdjustmentFindManyArgsSchema"
import { BookingStatusHistoryFindManyArgsSchema } from "../outputTypeSchemas/BookingStatusHistoryFindManyArgsSchema"
import { BookingCountOutputTypeArgsSchema } from "../outputTypeSchemas/BookingCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

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
  statusHistory: z.union([z.boolean(),z.lazy(() => BookingStatusHistoryFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => BookingCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const BookingUpsertArgsSchema: z.ZodType<Prisma.BookingUpsertArgs> = z.object({
  select: BookingSelectSchema.optional(),
  include: z.lazy(() => BookingIncludeSchema).optional(),
  where: BookingWhereUniqueInputSchema, 
  create: z.union([ BookingCreateInputSchema, BookingUncheckedCreateInputSchema ]),
  update: z.union([ BookingUpdateInputSchema, BookingUncheckedUpdateInputSchema ]),
}).strict();

export default BookingUpsertArgsSchema;
