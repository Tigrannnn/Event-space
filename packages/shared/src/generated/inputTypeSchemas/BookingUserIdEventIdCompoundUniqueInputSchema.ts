import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const BookingUserIdEventIdCompoundUniqueInputSchema: z.ZodType<Prisma.BookingUserIdEventIdCompoundUniqueInput> = z.object({
  userId: z.string(),
  eventId: z.string(),
}).strict();

export default BookingUserIdEventIdCompoundUniqueInputSchema;
