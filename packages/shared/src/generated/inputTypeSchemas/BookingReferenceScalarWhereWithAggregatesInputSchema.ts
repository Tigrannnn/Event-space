import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const BookingReferenceScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.BookingReferenceScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => BookingReferenceScalarWhereWithAggregatesInputSchema), z.lazy(() => BookingReferenceScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingReferenceScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingReferenceScalarWhereWithAggregatesInputSchema), z.lazy(() => BookingReferenceScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
}).strict();

export default BookingReferenceScalarWhereWithAggregatesInputSchema;
