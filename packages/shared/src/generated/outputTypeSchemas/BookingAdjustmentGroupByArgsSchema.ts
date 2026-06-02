import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingAdjustmentWhereInputSchema } from '../inputTypeSchemas/BookingAdjustmentWhereInputSchema'
import { BookingAdjustmentOrderByWithAggregationInputSchema } from '../inputTypeSchemas/BookingAdjustmentOrderByWithAggregationInputSchema'
import { BookingAdjustmentScalarFieldEnumSchema } from '../inputTypeSchemas/BookingAdjustmentScalarFieldEnumSchema'
import { BookingAdjustmentScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/BookingAdjustmentScalarWhereWithAggregatesInputSchema'

export const BookingAdjustmentGroupByArgsSchema: z.ZodType<Prisma.BookingAdjustmentGroupByArgs> = z.object({
  where: BookingAdjustmentWhereInputSchema.optional(), 
  orderBy: z.union([ BookingAdjustmentOrderByWithAggregationInputSchema.array(), BookingAdjustmentOrderByWithAggregationInputSchema ]).optional(),
  by: BookingAdjustmentScalarFieldEnumSchema.array(), 
  having: BookingAdjustmentScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default BookingAdjustmentGroupByArgsSchema;
