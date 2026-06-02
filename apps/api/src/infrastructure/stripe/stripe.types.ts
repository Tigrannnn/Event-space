import Stripe from 'stripe';

export type StripeInstance = InstanceType<typeof Stripe>;

export type StripePaymentIntent = Awaited<ReturnType<StripeInstance['paymentIntents']['create']>>;
export type StripePaymentIntentRetrieve = Awaited<ReturnType<StripeInstance['paymentIntents']['retrieve']>>;
export type StripeRefund = Awaited<ReturnType<StripeInstance['refunds']['create']>>;
export type StripeEvent = ReturnType<StripeInstance['webhooks']['constructEvent']>;
export type StripeCharge = Awaited<ReturnType<StripeInstance['charges']['retrieve']>>;
export type StripeBalanceTransaction = Awaited<ReturnType<StripeInstance['balanceTransactions']['retrieve']>>;

export const CANCELABLE_PAYMENT_INTENT_STATUSES = [
    'requires_payment_method',
    'requires_capture',
    'requires_reauthorization',
    'requires_confirmation',
    'requires_action',
    'expired',
    'processing',
] as const;

export type CancelablePaymentIntentStatus = typeof CANCELABLE_PAYMENT_INTENT_STATUSES[number];