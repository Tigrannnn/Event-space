import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BookingReferenceOrderByWithRelationInputSchema: z.ZodType<Prisma.BookingReferenceOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export default BookingReferenceOrderByWithRelationInputSchema;
