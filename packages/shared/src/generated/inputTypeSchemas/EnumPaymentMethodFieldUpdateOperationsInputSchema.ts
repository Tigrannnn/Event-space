import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PaymentMethodSchema } from './PaymentMethodSchema';

export const EnumPaymentMethodFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumPaymentMethodFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => PaymentMethodSchema).optional(),
});

export default EnumPaymentMethodFieldUpdateOperationsInputSchema;
