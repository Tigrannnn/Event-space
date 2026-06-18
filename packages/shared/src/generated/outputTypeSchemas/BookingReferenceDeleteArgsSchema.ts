import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingReferenceWhereUniqueInputSchema } from '../inputTypeSchemas/BookingReferenceWhereUniqueInputSchema'
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const BookingReferenceSelectSchema: z.ZodType<Prisma.BookingReferenceSelect> = z.object({
  id: z.boolean().optional(),
  createdAt: z.boolean().optional(),
}).strict()

export const BookingReferenceDeleteArgsSchema: z.ZodType<Prisma.BookingReferenceDeleteArgs> = z.object({
  select: BookingReferenceSelectSchema.optional(),
  where: BookingReferenceWhereUniqueInputSchema, 
}).strict();

export default BookingReferenceDeleteArgsSchema;
