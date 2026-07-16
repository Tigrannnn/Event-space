import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const BookingUserIdOccurrenceIdCompoundUniqueInputSchema: z.ZodType<Prisma.BookingUserIdOccurrenceIdCompoundUniqueInput> = z.strictObject({
  userId: z.string(),
  occurrenceId: z.string(),
});

export default BookingUserIdOccurrenceIdCompoundUniqueInputSchema;
