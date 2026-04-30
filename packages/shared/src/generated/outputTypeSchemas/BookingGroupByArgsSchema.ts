import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingWhereInputSchema } from '../inputTypeSchemas/BookingWhereInputSchema'
import { BookingOrderByWithAggregationInputSchema } from '../inputTypeSchemas/BookingOrderByWithAggregationInputSchema'
import { BookingScalarFieldEnumSchema } from '../inputTypeSchemas/BookingScalarFieldEnumSchema'
import { BookingScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/BookingScalarWhereWithAggregatesInputSchema'

export const BookingGroupByArgsSchema: z.ZodType<Prisma.BookingGroupByArgs> = z.object({
  where: BookingWhereInputSchema.optional(), 
  orderBy: z.union([ BookingOrderByWithAggregationInputSchema.array(), BookingOrderByWithAggregationInputSchema ]).optional(),
  by: BookingScalarFieldEnumSchema.array(), 
  having: BookingScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default BookingGroupByArgsSchema;
