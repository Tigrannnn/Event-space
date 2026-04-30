import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingWhereInputSchema } from '../inputTypeSchemas/BookingWhereInputSchema'
import { BookingOrderByWithRelationInputSchema } from '../inputTypeSchemas/BookingOrderByWithRelationInputSchema'
import { BookingWhereUniqueInputSchema } from '../inputTypeSchemas/BookingWhereUniqueInputSchema'

export const BookingAggregateArgsSchema: z.ZodType<Prisma.BookingAggregateArgs> = z.object({
  where: BookingWhereInputSchema.optional(), 
  orderBy: z.union([ BookingOrderByWithRelationInputSchema.array(), BookingOrderByWithRelationInputSchema ]).optional(),
  cursor: BookingWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default BookingAggregateArgsSchema;
