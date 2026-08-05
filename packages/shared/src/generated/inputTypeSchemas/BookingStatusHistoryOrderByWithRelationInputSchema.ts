import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { BookingOrderByWithRelationInputSchema } from './BookingOrderByWithRelationInputSchema';

export const BookingStatusHistoryOrderByWithRelationInputSchema: z.ZodType<Prisma.BookingStatusHistoryOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  bookingId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  validFrom: z.lazy(() => SortOrderSchema).optional(),
  validTo: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  booking: z.lazy(() => BookingOrderByWithRelationInputSchema).optional(),
});

export default BookingStatusHistoryOrderByWithRelationInputSchema;
