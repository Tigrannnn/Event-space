import { z } from 'zod';

export const PaymentMethodSchema = z.enum(['SITE_PAYMENT','OFFLINE_PAID','PAY_ON_ARRIVAL']);

export type PaymentMethodType = `${z.infer<typeof PaymentMethodSchema>}`

export default PaymentMethodSchema;
