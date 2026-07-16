import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingWhereInputSchema } from './BookingWhereInputSchema';

export const BookingScalarRelationFilterSchema: z.ZodType<Prisma.BookingScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => BookingWhereInputSchema).optional(),
  isNot: z.lazy(() => BookingWhereInputSchema).optional(),
});

export default BookingScalarRelationFilterSchema;
