import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingAdjustmentWhereInputSchema } from '../inputTypeSchemas/BookingAdjustmentWhereInputSchema'
import { BookingAdjustmentOrderByWithRelationInputSchema } from '../inputTypeSchemas/BookingAdjustmentOrderByWithRelationInputSchema'
import { BookingAdjustmentWhereUniqueInputSchema } from '../inputTypeSchemas/BookingAdjustmentWhereUniqueInputSchema'

export const BookingAdjustmentAggregateArgsSchema: z.ZodType<Prisma.BookingAdjustmentAggregateArgs> = z.object({
  where: BookingAdjustmentWhereInputSchema.optional(), 
  orderBy: z.union([ BookingAdjustmentOrderByWithRelationInputSchema.array(), BookingAdjustmentOrderByWithRelationInputSchema ]).optional(),
  cursor: BookingAdjustmentWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default BookingAdjustmentAggregateArgsSchema;
