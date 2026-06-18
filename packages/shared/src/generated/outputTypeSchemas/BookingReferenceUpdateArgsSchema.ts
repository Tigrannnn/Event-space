import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingReferenceUpdateInputSchema } from '../inputTypeSchemas/BookingReferenceUpdateInputSchema'
import { BookingReferenceUncheckedUpdateInputSchema } from '../inputTypeSchemas/BookingReferenceUncheckedUpdateInputSchema'
import { BookingReferenceWhereUniqueInputSchema } from '../inputTypeSchemas/BookingReferenceWhereUniqueInputSchema'
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const BookingReferenceSelectSchema: z.ZodType<Prisma.BookingReferenceSelect> = z.object({
  id: z.boolean().optional(),
  createdAt: z.boolean().optional(),
}).strict()

export const BookingReferenceUpdateArgsSchema: z.ZodType<Prisma.BookingReferenceUpdateArgs> = z.object({
  select: BookingReferenceSelectSchema.optional(),
  data: z.union([ BookingReferenceUpdateInputSchema, BookingReferenceUncheckedUpdateInputSchema ]),
  where: BookingReferenceWhereUniqueInputSchema, 
}).strict();

export default BookingReferenceUpdateArgsSchema;
