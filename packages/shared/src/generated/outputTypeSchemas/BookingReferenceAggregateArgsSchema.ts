import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingReferenceWhereInputSchema } from '../inputTypeSchemas/BookingReferenceWhereInputSchema'
import { BookingReferenceOrderByWithRelationInputSchema } from '../inputTypeSchemas/BookingReferenceOrderByWithRelationInputSchema'
import { BookingReferenceWhereUniqueInputSchema } from '../inputTypeSchemas/BookingReferenceWhereUniqueInputSchema'

export const BookingReferenceAggregateArgsSchema: z.ZodType<Prisma.BookingReferenceAggregateArgs> = z.object({
  where: BookingReferenceWhereInputSchema.optional(), 
  orderBy: z.union([ BookingReferenceOrderByWithRelationInputSchema.array(), BookingReferenceOrderByWithRelationInputSchema ]).optional(),
  cursor: BookingReferenceWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default BookingReferenceAggregateArgsSchema;
