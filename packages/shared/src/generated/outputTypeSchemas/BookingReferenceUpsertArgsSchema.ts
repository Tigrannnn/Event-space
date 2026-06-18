import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingReferenceWhereUniqueInputSchema } from '../inputTypeSchemas/BookingReferenceWhereUniqueInputSchema'
import { BookingReferenceCreateInputSchema } from '../inputTypeSchemas/BookingReferenceCreateInputSchema'
import { BookingReferenceUncheckedCreateInputSchema } from '../inputTypeSchemas/BookingReferenceUncheckedCreateInputSchema'
import { BookingReferenceUpdateInputSchema } from '../inputTypeSchemas/BookingReferenceUpdateInputSchema'
import { BookingReferenceUncheckedUpdateInputSchema } from '../inputTypeSchemas/BookingReferenceUncheckedUpdateInputSchema'
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const BookingReferenceSelectSchema: z.ZodType<Prisma.BookingReferenceSelect> = z.object({
  id: z.boolean().optional(),
  createdAt: z.boolean().optional(),
}).strict()

export const BookingReferenceUpsertArgsSchema: z.ZodType<Prisma.BookingReferenceUpsertArgs> = z.object({
  select: BookingReferenceSelectSchema.optional(),
  where: BookingReferenceWhereUniqueInputSchema, 
  create: z.union([ BookingReferenceCreateInputSchema, BookingReferenceUncheckedCreateInputSchema ]),
  update: z.union([ BookingReferenceUpdateInputSchema, BookingReferenceUncheckedUpdateInputSchema ]),
}).strict();

export default BookingReferenceUpsertArgsSchema;
