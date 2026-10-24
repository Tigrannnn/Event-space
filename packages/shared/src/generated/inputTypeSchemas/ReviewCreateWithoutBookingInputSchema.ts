import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewStatusSchema } from './ReviewStatusSchema';
import { EventCreateNestedOneWithoutReviewsInputSchema } from './EventCreateNestedOneWithoutReviewsInputSchema';
import { UserCreateNestedOneWithoutReviewsInputSchema } from './UserCreateNestedOneWithoutReviewsInputSchema';

export const ReviewCreateWithoutBookingInputSchema: z.ZodType<Prisma.ReviewCreateWithoutBookingInput> = z.strictObject({
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
  event: z.lazy(() => EventCreateNestedOneWithoutReviewsInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutReviewsInputSchema),
});

export default ReviewCreateWithoutBookingInputSchema;
