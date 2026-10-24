import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewStatusSchema } from './ReviewStatusSchema';

export const ReviewCreateManyEventInputSchema: z.ZodType<Prisma.ReviewCreateManyEventInput> = z.strictObject({
  id: z.uuid().optional(),
  bookingId: z.string(),
  userId: z.string(),
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
});

export default ReviewCreateManyEventInputSchema;
