import { Injectable, Logger } from '@nestjs/common';
import { StripeService } from '@infra/stripe/stripe.service';
import {
	CANCELABLE_PAYMENT_INTENT_STATUSES,
	type CancelablePaymentIntentStatus,
	type StripeBalanceTransaction,
	type StripePaymentIntentRetrieve,
} from '@infra/stripe/stripe.types';
import {
	BookingLedgerService,
	parseQueuedRefundReason,
	type QueuedRefundRow,
} from './booking-ledger.service';

export interface RefundPlan {
	grossInCents: number;
	amountInCents: (paymentIntent: StripePaymentIntentRetrieve) => Promise<number>;
	refundIdempotencyKey: (amountInCents: number) => string;
	cancelIdempotencyKey: string;
	successReason: string;
	failureReason: string;
	failureLogSuffix: string;
	withholdsFee: boolean;
	feeWithheldInCents?: number;
}

export interface RefundOutcome {
	refundedInCents: number | null;
	failed: boolean;
	coveredByFee: { grossInCents: number; feeInCents: number } | null;
}

export const QUEUE_IDLE_MS = 2 * 60 * 1000;
export const QUEUE_GIVE_UP_MS = 24 * 60 * 60 * 1000;
const QUEUE_BATCH_SIZE = 50;

const GAVE_UP_REASON =
	'Refund was not completed within 24 hours. Check the payment in Stripe and refund it by hand.';

@Injectable()
export class BookingRefundService {
	private readonly logger = new Logger(BookingRefundService.name);

	constructor(
		private readonly stripe: StripeService,
		private readonly ledger: BookingLedgerService,
	) {}

	async settle(
		booking: { id: string; paymentIntentId: string; operationKey?: string },
		plan: RefundPlan,
	): Promise<RefundOutcome> {
		const operationKey = booking.operationKey ?? '';
		let refunded: { amountInCents: number; id: string } | null = null;
		let failed = false;
		let coveredByFee: RefundOutcome['coveredByFee'] = null;
		let paidInCents: number | null = null;

		try {
			const paymentIntent = await this.stripe.retrievePaymentIntent(booking.paymentIntentId);

			if (paymentIntent.status === 'succeeded') {
				paidInCents = paymentIntent.amount_received ?? paymentIntent.amount;
				const amountInCents = await plan.amountInCents(paymentIntent);

				if (amountInCents > 0) {
					const refund = await this.stripe.refund(
						booking.paymentIntentId,
						plan.refundIdempotencyKey(amountInCents),
						amountInCents,
					);
					refunded = { amountInCents: refund.amount, id: refund.id };
				} else if (plan.grossInCents > 0) {
					coveredByFee = {
						grossInCents: plan.grossInCents,
						feeInCents: plan.grossInCents - amountInCents,
					};
				}
			} else if (
				CANCELABLE_PAYMENT_INTENT_STATUSES.includes(
					paymentIntent.status as CancelablePaymentIntentStatus,
				)
			) {
				await this.stripe.cancelPaymentIntent(booking.paymentIntentId, plan.cancelIdempotencyKey);
			}
		} catch (stripeError) {
			failed = true;
			this.logger.error(
				`Stripe refund failed for booking ${booking.id}${plan.failureLogSuffix}:`,
				stripeError,
			);
		}

		if (paidInCents !== null) {
			await this.ledger.recordChargeIfMissing({
				bookingId: booking.id,
				paymentIntentId: booking.paymentIntentId,
				amountInCents: paidInCents,
				reason: 'Payment captured, recorded when the booking was cancelled',
			});
		}

		if (refunded) {
			const feeWithheldInCents = plan.withholdsFee
				? Math.max(0, plan.grossInCents - refunded.amountInCents)
				: plan.feeWithheldInCents;

			const closed = await this.ledger.completeQueuedRefund({
				paymentIntentId: booking.paymentIntentId,
				amountInCents: refunded.amountInCents,
				stripeRefundId: refunded.id,
				reason: plan.successReason,
				operationKey,
				feeWithheldInCents,
			});

			if (!closed) {
				await this.ledger.recordRefund({
					bookingId: booking.id,
					paymentIntentId: booking.paymentIntentId,
					amountInCents: refunded.amountInCents,
					stripeRefundId: refunded.id,
					reason: plan.successReason,
					operationKey,
					feeWithheldInCents,
				});
			}
		} else if (failed) {
			const stillQueued = await this.ledger.touchQueuedRefund(booking.paymentIntentId, operationKey);

			if (!stillQueued) {
				await this.ledger.recordFailedRefund({
					bookingId: booking.id,
					paymentIntentId: booking.paymentIntentId,
					reason: plan.failureReason,
					operationKey,
				});
			}
		} else if (coveredByFee) {
			const reason =
				`Refund by the cancellation rules was ${(coveredByFee.grossInCents / 100).toFixed(2)} AMD, ` +
				`the Stripe fee of ${(coveredByFee.feeInCents / 100).toFixed(2)} AMD covers it entirely`;

			const closed = await this.ledger.completeQueuedRefund({
				paymentIntentId: booking.paymentIntentId,
				amountInCents: 0,
				stripeRefundId: null,
				reason,
				operationKey,
			});

			if (!closed) {
				await this.ledger.recordRefundWithoutMoney({
					bookingId: booking.id,
					paymentIntentId: booking.paymentIntentId,
					status: 'SUCCEEDED',
					reason,
					operationKey,
				});
			}
		} else {
			await this.ledger.discardQueuedRefund(booking.paymentIntentId, operationKey);
		}

		return { refundedInCents: refunded?.amountInCents ?? null, failed, coveredByFee };
	}

	refundPlan(params: {
		paymentIntentId: string;
		grossInCents: number;
		withholdFee: boolean;
		idempotencyKey: string;
		successReason: string;
		failureReason: string;
		failureLogSuffix: string;
		feeWithheldInCents?: number;
	}): RefundPlan {
		const { paymentIntentId, grossInCents, withholdFee, idempotencyKey } = params;

		return {
			grossInCents,
			amountInCents: async (paymentIntent) => {
				if (grossInCents <= 0 || !withholdFee) return Math.max(0, grossInCents);

				const charge = await this.stripe.getCharge(paymentIntent.latest_charge as string);
				const stripeFeeInCents = (charge.balance_transaction as StripeBalanceTransaction).fee;
				const alreadyWithheld = await this.ledger.feeWithheldInCents(paymentIntentId);

				return grossInCents - Math.max(0, stripeFeeInCents - alreadyWithheld);
			},
			refundIdempotencyKey: (amountInCents) =>
				withholdFee ? `refund-${paymentIntentId}-${amountInCents}` : idempotencyKey,
			cancelIdempotencyKey: withholdFee ? `cancel-${paymentIntentId}` : idempotencyKey,
			successReason: params.successReason,
			failureReason: params.failureReason,
			failureLogSuffix: params.failureLogSuffix,
			withholdsFee: withholdFee && grossInCents > 0,
			feeWithheldInCents: params.feeWithheldInCents,
		};
	}

	async retryQueued(now: Date = new Date()): Promise<number> {
		const rows = await this.ledger.findQueuedRefunds({
			idleBefore: new Date(now.getTime() - QUEUE_IDLE_MS),
			limit: QUEUE_BATCH_SIZE,
		});

		let handled = 0;

		for (const row of rows) {
			try {
				if (!(await this.ledger.claimQueuedRefund(row))) continue;

				if (now.getTime() - row.createdAt.getTime() >= QUEUE_GIVE_UP_MS) {
					await this.ledger.abandonQueuedRefund(row.id, GAVE_UP_REASON);
					this.logger.error(
						`Refund for booking ${row.bookingId} was not completed in 24 hours and needs manual handling`,
					);
					continue;
				}

				const plan = this.planForQueued(row);
				if (!plan) {
					this.logger.warn(`Queued refund ${row.id} has no recognisable reason, skipping`);
					continue;
				}

				await this.settle(
					{
						id: row.bookingId,
						paymentIntentId: row.stripePaymentIntentId,
						operationKey: row.operationKey,
					},
					plan,
				);
				handled += 1;
			} catch (error) {
				this.logger.error(`Retrying queued refund ${row.id} failed`, error as Error);
			}
		}

		return handled;
	}

	private planForQueued(row: QueuedRefundRow): RefundPlan | null {
		const parsed = parseQueuedRefundReason(row.reason);
		if (!parsed) return null;

		return this.refundPlan({
			paymentIntentId: row.stripePaymentIntentId,
			grossInCents: Math.round(Number(row.amount) * 100),
			withholdFee: parsed.kind === 'withhold-fee',
			idempotencyKey: row.operationKey || `full-refund-${row.bookingId}`,
			feeWithheldInCents:
				row.feeWithheld === null ? undefined : Math.round(Number(row.feeWithheld) * 100),
			successReason: parsed.text,
			failureReason: 'Refund could not be processed at Stripe',
			failureLogSuffix: ' (queued retry)',
		});
	}
}
