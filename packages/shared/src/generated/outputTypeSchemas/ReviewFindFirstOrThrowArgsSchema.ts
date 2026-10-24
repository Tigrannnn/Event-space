import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReviewIncludeSchema } from '../inputTypeSchemas/ReviewIncludeSchema'
import { ReviewWhereInputSchema } from '../inputTypeSchemas/ReviewWhereInputSchema'
import { ReviewOrderByWithRelationInputSchema } from '../inputTypeSchemas/ReviewOrderByWithRelationInputSchema'
import { ReviewWhereUniqueInputSchema } from '../inputTypeSchemas/ReviewWhereUniqueInputSchema'
import { ReviewScalarFieldEnumSchema } from '../inputTypeSchemas/ReviewScalarFieldEnumSchema'
import { BookingArgsSchema } from "../outputTypeSchemas/BookingArgsSchema"
import { EventArgsSchema } from "../outputTypeSchemas/EventArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ReviewSelectSchema: z.ZodType<Prisma.ReviewSelect> = z.object({
  id: z.boolean().optional(),
  bookingId: z.boolean().optional(),
  eventId: z.boolean().optional(),
  userId: z.boolean().optional(),
  rating: z.boolean().optional(),
  text: z.boolean().optional(),
  status: z.boolean().optional(),
  moderatedAt: z.boolean().optional(),
  moderatedByAdminId: z.boolean().optional(),
  rejectReason: z.boolean().optional(),
  adminReply: z.boolean().optional(),
  adminReplyAt: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  booking: z.union([z.boolean(),z.lazy(() => BookingArgsSchema)]).optional(),
  event: z.union([z.boolean(),z.lazy(() => EventArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const ReviewFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ReviewFindFirstOrThrowArgs> = z.object({
  select: ReviewSelectSchema.optional(),
  include: z.lazy(() => ReviewIncludeSchema).optional(),
  where: ReviewWhereInputSchema.optional(), 
  orderBy: z.union([ ReviewOrderByWithRelationInputSchema.array(), ReviewOrderByWithRelationInputSchema ]).optional(),
  cursor: ReviewWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ReviewScalarFieldEnumSchema, ReviewScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export default ReviewFindFirstOrThrowArgsSchema;
