import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingAdjustmentWhereInputSchema } from './BookingAdjustmentWhereInputSchema';

export const BookingAdjustmentListRelationFilterSchema: z.ZodType<Prisma.BookingAdjustmentListRelationFilter> = z.strictObject({
  every: z.lazy(() => BookingAdjustmentWhereInputSchema).optional(),
  some: z.lazy(() => BookingAdjustmentWhereInputSchema).optional(),
  none: z.lazy(() => BookingAdjustmentWhereInputSchema).optional(),
});

export default BookingAdjustmentListRelationFilterSchema;
