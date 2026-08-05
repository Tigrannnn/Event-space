import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BookingStatusHistoryIncludeSchema } from '../inputTypeSchemas/BookingStatusHistoryIncludeSchema'
import { BookingStatusHistoryWhereInputSchema } from '../inputTypeSchemas/BookingStatusHistoryWhereInputSchema'
import { BookingStatusHistoryOrderByWithRelationInputSchema } from '../inputTypeSchemas/BookingStatusHistoryOrderByWithRelationInputSchema'
import { BookingStatusHistoryWhereUniqueInputSchema } from '../inputTypeSchemas/BookingStatusHistoryWhereUniqueInputSchema'
import { BookingStatusHistoryScalarFieldEnumSchema } from '../inputTypeSchemas/BookingStatusHistoryScalarFieldEnumSchema'
import { BookingArgsSchema } from "../outputTypeSchemas/BookingArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const BookingStatusHistorySelectSchema: z.ZodType<Prisma.BookingStatusHistorySelect> = z.object({
  id: z.boolean().optional(),
  bookingId: z.boolean().optional(),
  status: z.boolean().optional(),
  validFrom: z.boolean().optional(),
  validTo: z.boolean().optional(),
  booking: z.union([z.boolean(),z.lazy(() => BookingArgsSchema)]).optional(),
}).strict()

export const BookingStatusHistoryFindFirstOrThrowArgsSchema: z.ZodType<Prisma.BookingStatusHistoryFindFirstOrThrowArgs> = z.object({
  select: BookingStatusHistorySelectSchema.optional(),
  include: z.lazy(() => BookingStatusHistoryIncludeSchema).optional(),
  where: BookingStatusHistoryWhereInputSchema.optional(), 
  orderBy: z.union([ BookingStatusHistoryOrderByWithRelationInputSchema.array(), BookingStatusHistoryOrderByWithRelationInputSchema ]).optional(),
  cursor: BookingStatusHistoryWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BookingStatusHistoryScalarFieldEnumSchema, BookingStatusHistoryScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export default BookingStatusHistoryFindFirstOrThrowArgsSchema;
