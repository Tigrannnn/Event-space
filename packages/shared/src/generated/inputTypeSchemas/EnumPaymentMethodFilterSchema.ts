import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PaymentMethodSchema } from './PaymentMethodSchema';
import { NestedEnumPaymentMethodFilterSchema } from './NestedEnumPaymentMethodFilterSchema';

export const EnumPaymentMethodFilterSchema: z.ZodType<Prisma.EnumPaymentMethodFilter> = z.strictObject({
  equals: z.lazy(() => PaymentMethodSchema).optional(),
  in: z.lazy(() => PaymentMethodSchema).array().optional(),
  notIn: z.lazy(() => PaymentMethodSchema).array().optional(),
  not: z.union([ z.lazy(() => PaymentMethodSchema), z.lazy(() => NestedEnumPaymentMethodFilterSchema) ]).optional(),
});

export default EnumPaymentMethodFilterSchema;
