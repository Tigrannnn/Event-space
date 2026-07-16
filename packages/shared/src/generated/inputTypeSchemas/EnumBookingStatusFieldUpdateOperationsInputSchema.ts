import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingStatusSchema } from './BookingStatusSchema';

export const EnumBookingStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumBookingStatusFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => BookingStatusSchema).optional(),
});

export default EnumBookingStatusFieldUpdateOperationsInputSchema;
