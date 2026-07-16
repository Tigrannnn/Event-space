import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { IntFilterSchema } from './IntFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const BookingReferenceWhereInputSchema: z.ZodType<Prisma.BookingReferenceWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => BookingReferenceWhereInputSchema), z.lazy(() => BookingReferenceWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingReferenceWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingReferenceWhereInputSchema), z.lazy(() => BookingReferenceWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export default BookingReferenceWhereInputSchema;
