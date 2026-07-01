import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const BookingUserIdOccurrenceIdCompoundUniqueInputSchema: z.ZodType<Prisma.BookingUserIdOccurrenceIdCompoundUniqueInput> = z.object({
  userId: z.string(),
  occurrenceId: z.string(),
}).strict();

export default BookingUserIdOccurrenceIdCompoundUniqueInputSchema;
