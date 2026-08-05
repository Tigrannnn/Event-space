import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingStatusHistoryWhereInputSchema } from '../inputTypeSchemas/BookingStatusHistoryWhereInputSchema'
import { BookingStatusHistoryOrderByWithAggregationInputSchema } from '../inputTypeSchemas/BookingStatusHistoryOrderByWithAggregationInputSchema'
import { BookingStatusHistoryScalarFieldEnumSchema } from '../inputTypeSchemas/BookingStatusHistoryScalarFieldEnumSchema'
import { BookingStatusHistoryScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/BookingStatusHistoryScalarWhereWithAggregatesInputSchema'

export const BookingStatusHistoryGroupByArgsSchema: z.ZodType<Prisma.BookingStatusHistoryGroupByArgs> = z.object({
  where: BookingStatusHistoryWhereInputSchema.optional(), 
  orderBy: z.union([ BookingStatusHistoryOrderByWithAggregationInputSchema.array(), BookingStatusHistoryOrderByWithAggregationInputSchema ]).optional(),
  by: BookingStatusHistoryScalarFieldEnumSchema.array(), 
  having: BookingStatusHistoryScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default BookingStatusHistoryGroupByArgsSchema;
