import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingAdjustmentIncludeSchema } from '../inputTypeSchemas/BookingAdjustmentIncludeSchema'
import { BookingAdjustmentWhereInputSchema } from '../inputTypeSchemas/BookingAdjustmentWhereInputSchema'
import { BookingAdjustmentOrderByWithRelationInputSchema } from '../inputTypeSchemas/BookingAdjustmentOrderByWithRelationInputSchema'
import { BookingAdjustmentWhereUniqueInputSchema } from '../inputTypeSchemas/BookingAdjustmentWhereUniqueInputSchema'
import { BookingAdjustmentScalarFieldEnumSchema } from '../inputTypeSchemas/BookingAdjustmentScalarFieldEnumSchema'
import { BookingArgsSchema } from "../outputTypeSchemas/BookingArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const BookingAdjustmentSelectSchema: z.ZodType<Prisma.BookingAdjustmentSelect> = z.object({
  id: z.boolean().optional(),
  bookingId: z.boolean().optional(),
  type: z.boolean().optional(),
  amount: z.boolean().optional(),
  currency: z.boolean().optional(),
  stripePaymentIntentId: z.boolean().optional(),
  stripeRefundId: z.boolean().optional(),
  status: z.boolean().optional(),
  reason: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  booking: z.union([z.boolean(),z.lazy(() => BookingArgsSchema)]).optional(),
}).strict()

export const BookingAdjustmentFindFirstOrThrowArgsSchema: z.ZodType<Prisma.BookingAdjustmentFindFirstOrThrowArgs> = z.object({
  select: BookingAdjustmentSelectSchema.optional(),
  include: z.lazy(() => BookingAdjustmentIncludeSchema).optional(),
  where: BookingAdjustmentWhereInputSchema.optional(), 
  orderBy: z.union([ BookingAdjustmentOrderByWithRelationInputSchema.array(), BookingAdjustmentOrderByWithRelationInputSchema ]).optional(),
  cursor: BookingAdjustmentWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BookingAdjustmentScalarFieldEnumSchema, BookingAdjustmentScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export default BookingAdjustmentFindFirstOrThrowArgsSchema;
