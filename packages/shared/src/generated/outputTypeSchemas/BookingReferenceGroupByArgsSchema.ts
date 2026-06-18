import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingReferenceWhereInputSchema } from '../inputTypeSchemas/BookingReferenceWhereInputSchema'
import { BookingReferenceOrderByWithAggregationInputSchema } from '../inputTypeSchemas/BookingReferenceOrderByWithAggregationInputSchema'
import { BookingReferenceScalarFieldEnumSchema } from '../inputTypeSchemas/BookingReferenceScalarFieldEnumSchema'
import { BookingReferenceScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/BookingReferenceScalarWhereWithAggregatesInputSchema'

export const BookingReferenceGroupByArgsSchema: z.ZodType<Prisma.BookingReferenceGroupByArgs> = z.object({
  where: BookingReferenceWhereInputSchema.optional(), 
  orderBy: z.union([ BookingReferenceOrderByWithAggregationInputSchema.array(), BookingReferenceOrderByWithAggregationInputSchema ]).optional(),
  by: BookingReferenceScalarFieldEnumSchema.array(), 
  having: BookingReferenceScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default BookingReferenceGroupByArgsSchema;
