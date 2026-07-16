import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';

export const BookingReferenceUpdateManyMutationInputSchema: z.ZodType<Prisma.BookingReferenceUpdateManyMutationInput> = z.strictObject({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export default BookingReferenceUpdateManyMutationInputSchema;
