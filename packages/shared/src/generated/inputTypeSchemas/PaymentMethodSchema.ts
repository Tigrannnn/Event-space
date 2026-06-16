import { z } from 'zod';

export const PaymentMethodSchema = z.enum(['STRIPE','OFFLINE']);

export type PaymentMethodType = `${z.infer<typeof PaymentMethodSchema>}`

export default PaymentMethodSchema;
