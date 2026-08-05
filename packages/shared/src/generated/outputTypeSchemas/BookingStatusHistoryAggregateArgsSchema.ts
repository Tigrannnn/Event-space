import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingStatusHistoryWhereInputSchema } from '../inputTypeSchemas/BookingStatusHistoryWhereInputSchema'
import { BookingStatusHistoryOrderByWithRelationInputSchema } from '../inputTypeSchemas/BookingStatusHistoryOrderByWithRelationInputSchema'
import { BookingStatusHistoryWhereUniqueInputSchema } from '../inputTypeSchemas/BookingStatusHistoryWhereUniqueInputSchema'

export const BookingStatusHistoryAggregateArgsSchema: z.ZodType<Prisma.BookingStatusHistoryAggregateArgs> = z.object({
  where: BookingStatusHistoryWhereInputSchema.optional(), 
  orderBy: z.union([ BookingStatusHistoryOrderByWithRelationInputSchema.array(), BookingStatusHistoryOrderByWithRelationInputSchema ]).optional(),
  cursor: BookingStatusHistoryWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default BookingStatusHistoryAggregateArgsSchema;
