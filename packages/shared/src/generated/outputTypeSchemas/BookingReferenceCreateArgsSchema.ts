import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingReferenceCreateInputSchema } from '../inputTypeSchemas/BookingReferenceCreateInputSchema'
import { BookingReferenceUncheckedCreateInputSchema } from '../inputTypeSchemas/BookingReferenceUncheckedCreateInputSchema'
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const BookingReferenceSelectSchema: z.ZodType<Prisma.BookingReferenceSelect> = z.object({
  id: z.boolean().optional(),
  createdAt: z.boolean().optional(),
}).strict()

export const BookingReferenceCreateArgsSchema: z.ZodType<Prisma.BookingReferenceCreateArgs> = z.object({
  select: BookingReferenceSelectSchema.optional(),
  data: z.union([ BookingReferenceCreateInputSchema, BookingReferenceUncheckedCreateInputSchema ]).optional(),
}).strict();

export default BookingReferenceCreateArgsSchema;
