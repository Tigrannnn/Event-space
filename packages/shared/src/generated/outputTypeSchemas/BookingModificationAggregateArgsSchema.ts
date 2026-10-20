import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingModificationWhereInputSchema } from '../inputTypeSchemas/BookingModificationWhereInputSchema'
import { BookingModificationOrderByWithRelationInputSchema } from '../inputTypeSchemas/BookingModificationOrderByWithRelationInputSchema'
import { BookingModificationWhereUniqueInputSchema } from '../inputTypeSchemas/BookingModificationWhereUniqueInputSchema'

export const BookingModificationAggregateArgsSchema: z.ZodType<Prisma.BookingModificationAggregateArgs> = z.object({
  where: BookingModificationWhereInputSchema.optional(), 
  orderBy: z.union([ BookingModificationOrderByWithRelationInputSchema.array(), BookingModificationOrderByWithRelationInputSchema ]).optional(),
  cursor: BookingModificationWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default BookingModificationAggregateArgsSchema;
