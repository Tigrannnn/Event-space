import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdjustmentTypeSchema } from './AdjustmentTypeSchema';

export const BookingAdjustmentStripePaymentIntentIdTypeOperationKeyCompoundUniqueInputSchema: z.ZodType<Prisma.BookingAdjustmentStripePaymentIntentIdTypeOperationKeyCompoundUniqueInput> = z.strictObject({
  stripePaymentIntentId: z.string(),
  type: z.lazy(() => AdjustmentTypeSchema),
  operationKey: z.string(),
});

export default BookingAdjustmentStripePaymentIntentIdTypeOperationKeyCompoundUniqueInputSchema;
