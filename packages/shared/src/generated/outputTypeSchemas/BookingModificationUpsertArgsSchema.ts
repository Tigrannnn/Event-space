import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingModificationIncludeSchema } from '../inputTypeSchemas/BookingModificationIncludeSchema'
import { BookingModificationWhereUniqueInputSchema } from '../inputTypeSchemas/BookingModificationWhereUniqueInputSchema'
import { BookingModificationCreateInputSchema } from '../inputTypeSchemas/BookingModificationCreateInputSchema'
import { BookingModificationUncheckedCreateInputSchema } from '../inputTypeSchemas/BookingModificationUncheckedCreateInputSchema'
import { BookingModificationUpdateInputSchema } from '../inputTypeSchemas/BookingModificationUpdateInputSchema'
import { BookingModificationUncheckedUpdateInputSchema } from '../inputTypeSchemas/BookingModificationUncheckedUpdateInputSchema'
import { BookingArgsSchema } from "../outputTypeSchemas/BookingArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const BookingModificationSelectSchema: z.ZodType<Prisma.BookingModificationSelect> = z.object({
  id: z.boolean().optional(),
  bookingId: z.boolean().optional(),
  fromQuantity: z.boolean().optional(),
  toQuantity: z.boolean().optional(),
  amount: z.boolean().optional(),
  paymentIntentId: z.boolean().optional(),
  status: z.boolean().optional(),
  failureReason: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  appliedAt: z.boolean().optional(),
  booking: z.union([z.boolean(),z.lazy(() => BookingArgsSchema)]).optional(),
}).strict()

export const BookingModificationUpsertArgsSchema: z.ZodType<Prisma.BookingModificationUpsertArgs> = z.object({
  select: BookingModificationSelectSchema.optional(),
  include: z.lazy(() => BookingModificationIncludeSchema).optional(),
  where: BookingModificationWhereUniqueInputSchema, 
  create: z.union([ BookingModificationCreateInputSchema, BookingModificationUncheckedCreateInputSchema ]),
  update: z.union([ BookingModificationUpdateInputSchema, BookingModificationUncheckedUpdateInputSchema ]),
}).strict();

export default BookingModificationUpsertArgsSchema;
