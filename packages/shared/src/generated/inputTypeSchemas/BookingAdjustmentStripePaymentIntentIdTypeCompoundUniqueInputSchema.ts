import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdjustmentTypeSchema } from './AdjustmentTypeSchema';

export const BookingAdjustmentStripePaymentIntentIdTypeCompoundUniqueInputSchema: z.ZodType<Prisma.BookingAdjustmentStripePaymentIntentIdTypeCompoundUniqueInput> = z.strictObject({
  stripePaymentIntentId: z.string(),
  type: z.lazy(() => AdjustmentTypeSchema),
});

export default BookingAdjustmentStripePaymentIntentIdTypeCompoundUniqueInputSchema;
