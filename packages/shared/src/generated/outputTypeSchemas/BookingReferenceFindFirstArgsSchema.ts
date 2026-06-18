import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingReferenceWhereInputSchema } from '../inputTypeSchemas/BookingReferenceWhereInputSchema'
import { BookingReferenceOrderByWithRelationInputSchema } from '../inputTypeSchemas/BookingReferenceOrderByWithRelationInputSchema'
import { BookingReferenceWhereUniqueInputSchema } from '../inputTypeSchemas/BookingReferenceWhereUniqueInputSchema'
import { BookingReferenceScalarFieldEnumSchema } from '../inputTypeSchemas/BookingReferenceScalarFieldEnumSchema'
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const BookingReferenceSelectSchema: z.ZodType<Prisma.BookingReferenceSelect> = z.object({
  id: z.boolean().optional(),
  createdAt: z.boolean().optional(),
}).strict()

export const BookingReferenceFindFirstArgsSchema: z.ZodType<Prisma.BookingReferenceFindFirstArgs> = z.object({
  select: BookingReferenceSelectSchema.optional(),
  where: BookingReferenceWhereInputSchema.optional(), 
  orderBy: z.union([ BookingReferenceOrderByWithRelationInputSchema.array(), BookingReferenceOrderByWithRelationInputSchema ]).optional(),
  cursor: BookingReferenceWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BookingReferenceScalarFieldEnumSchema, BookingReferenceScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export default BookingReferenceFindFirstArgsSchema;
