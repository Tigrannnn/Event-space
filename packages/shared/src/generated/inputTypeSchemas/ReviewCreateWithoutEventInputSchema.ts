import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewStatusSchema } from './ReviewStatusSchema';
import { BookingCreateNestedOneWithoutReviewInputSchema } from './BookingCreateNestedOneWithoutReviewInputSchema';
import { UserCreateNestedOneWithoutReviewsInputSchema } from './UserCreateNestedOneWithoutReviewsInputSchema';

export const ReviewCreateWithoutEventInputSchema: z.ZodType<Prisma.ReviewCreateWithoutEventInput> = z.strictObject({
  id: z.uuid().optional(),
  rating: z.number().int(),
  text: z.string().optional().nullable(),
  status: z.lazy(() => ReviewStatusSchema).optional(),
  moderatedAt: z.coerce.date().optional().nullable(),
  moderatedByAdminId: z.string().optional().nullable(),
  rejectReason: z.string().optional().nullable(),
  adminReply: z.string().optional().nullable(),
  adminReplyAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  booking: z.lazy(() => BookingCreateNestedOneWithoutReviewInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutReviewsInputSchema),
});

export default ReviewCreateWithoutEventInputSchema;
