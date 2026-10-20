import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingModificationWhereInputSchema } from '../inputTypeSchemas/BookingModificationWhereInputSchema'
import { BookingModificationOrderByWithAggregationInputSchema } from '../inputTypeSchemas/BookingModificationOrderByWithAggregationInputSchema'
import { BookingModificationScalarFieldEnumSchema } from '../inputTypeSchemas/BookingModificationScalarFieldEnumSchema'
import { BookingModificationScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/BookingModificationScalarWhereWithAggregatesInputSchema'

export const BookingModificationGroupByArgsSchema: z.ZodType<Prisma.BookingModificationGroupByArgs> = z.object({
  where: BookingModificationWhereInputSchema.optional(), 
  orderBy: z.union([ BookingModificationOrderByWithAggregationInputSchema.array(), BookingModificationOrderByWithAggregationInputSchema ]).optional(),
  by: BookingModificationScalarFieldEnumSchema.array(), 
  having: BookingModificationScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default BookingModificationGroupByArgsSchema;
