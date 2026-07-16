import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingReferenceWhereInputSchema } from './BookingReferenceWhereInputSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const BookingReferenceWhereUniqueInputSchema: z.ZodType<Prisma.BookingReferenceWhereUniqueInput> = z.object({
  id: z.number().int(),
})
.and(z.strictObject({
  id: z.number().int().optional(),
  AND: z.union([ z.lazy(() => BookingReferenceWhereInputSchema), z.lazy(() => BookingReferenceWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingReferenceWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingReferenceWhereInputSchema), z.lazy(() => BookingReferenceWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
}));

export default BookingReferenceWhereUniqueInputSchema;
