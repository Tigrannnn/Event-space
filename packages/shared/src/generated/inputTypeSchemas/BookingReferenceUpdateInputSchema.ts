import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';

export const BookingReferenceUpdateInputSchema: z.ZodType<Prisma.BookingReferenceUpdateInput> = z.strictObject({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export default BookingReferenceUpdateInputSchema;
