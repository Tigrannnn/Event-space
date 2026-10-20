import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingModificationWhereInputSchema } from './BookingModificationWhereInputSchema';

export const BookingModificationListRelationFilterSchema: z.ZodType<Prisma.BookingModificationListRelationFilter> = z.strictObject({
  every: z.lazy(() => BookingModificationWhereInputSchema).optional(),
  some: z.lazy(() => BookingModificationWhereInputSchema).optional(),
  none: z.lazy(() => BookingModificationWhereInputSchema).optional(),
});

export default BookingModificationListRelationFilterSchema;
