import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { StripeService } from '@infra/stripe/stripe.service';
import {
	CANCELABLE_PAYMENT_INTENT_STATUSES,
	type CancelablePaymentIntentStatus,
	type StripeBalanceTransaction,
	type StripePaymentIntentRetrieve,
} from '@infra/stripe/stripe.types';
import { readPayments, toLedgerRows } from './booking-money';
import { planGuestRefund, type GuestRefund } from './refund-allocation';
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
}

export interface RefundOutcome {
	refundedInCents: number | null;
	failed: boolean;
	coveredByFee: { grossInCents: number; feeInCents: number } | null;
}

export interface QueuedCancellation {
	bookingId: string;
	paymentIntentId: string | null;
	operationKey: string;
	plan: GuestRefund;
	withholdFee: boolean;
	reason: string;
	method: 'STRIPE' | 'MANUAL';
}

export function refundKeyFor(operationKey: string, paymentIntentId: string): string {
	return `${operationKey}:${paymentIntentId}`;
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
			const closed = await this.ledger.completeQueuedRefund({
				paymentIntentId: booking.paymentIntentId,
				amountInCents: refunded.amountInCents,
				stripeRefundId: refunded.id,
				reason: plan.successReason,
				operationKey,
			});

			if (!closed) {
				await this.ledger.recordRefund({
					bookingId: booking.id,
					paymentIntentId: booking.paymentIntentId,
					amountInCents: refunded.amountInCents,
					stripeRefundId: refunded.id,
					reason: plan.successReason,
					operationKey,
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
	}): RefundPlan {
		const { paymentIntentId, grossInCents, withholdFee, idempotencyKey } = params;

		return {
			grossInCents,
			amountInCents: async (paymentIntent) => {
				if (grossInCents <= 0 || !withholdFee) return Math.max(0, grossInCents);

				const charge = await this.stripe.getCharge(paymentIntent.latest_charge as string);
				const stripeFeeInCents = (charge.balance_transaction as StripeBalanceTransaction).fee;

				return grossInCents - stripeFeeInCents;
			},
			refundIdempotencyKey: (amountInCents) =>
				withholdFee ? `refund-${paymentIntentId}-${amountInCents}` : idempotencyKey,
			cancelIdempotencyKey: withholdFee ? `cancel-${paymentIntentId}` : idempotencyKey,
			successReason: params.successReason,
			failureReason: params.failureReason,
			failureLogSuffix: params.failureLogSuffix,
			withholdsFee: withholdFee && grossInCents > 0,
		};
	}

	async fillMissingFees(bookingId: string): Promise<void> {
		try {
			for (const paymentIntentId of await this.ledger.chargesMissingFee(bookingId)) {
				const paymentIntent = await this.stripe.retrievePaymentIntent(paymentIntentId);
				if (!paymentIntent.latest_charge) continue;

				const charge = await this.stripe.getCharge(paymentIntent.latest_charge as string);
				const balanceTx = charge.balance_transaction as StripeBalanceTransaction | null;
				if (!balanceTx || typeof balanceTx !== 'object' || typeof balanceTx.fee !== 'number') {
					continue;
				}

				await this.ledger.attachFee(paymentIntentId, balanceTx.fee);
			}
		} catch (error) {
			this.logger.warn(`Could not read the payment fee for booking ${bookingId}`, error as Error);
		}
	}

	async prepare(bookingId: string, paymentIntentId: string | null): Promise<void> {
		if (paymentIntentId) {
			try {
				const intent = await this.stripe.retrievePaymentIntent(paymentIntentId);
				if (intent.status === 'succeeded') {
					await this.ledger.recordChargeIfMissing({
						bookingId,
						paymentIntentId,
						amountInCents: intent.amount_received ?? intent.amount,
						reason: 'Payment captured, recorded before a refund',
					});
				}
			} catch (error) {
				this.logger.warn(`Could not check payment ${paymentIntentId} before a refund`, error as Error);
			}
		}

		await this.fillMissingFees(bookingId);
	}

	async planForBooking(
		db: Pick<Prisma.TransactionClient, 'bookingAdjustment'>,
		params: {
			bookingId: string;
			amount: number;
			quantity: number;
			guests: number;
			percentage: number;
			withholdFee: boolean;
		},
	): Promise<GuestRefund> {
		const rows = await this.ledger.listForBooking(db, params.bookingId);
		const amountInCents = Math.round(params.amount * 100);

		return planGuestRefund({
			payments: readPayments(toLedgerRows(rows)),
			guests: params.guests,
			unitPriceInCents: Math.round(amountInCents / params.quantity),
			percentage: params.percentage,
			withholdFee: params.withholdFee,
		});
	}

	async queuePlan(
		tx: Prisma.TransactionClient,
		bookingId: string,
		plan: GuestRefund,
		options: { operationKey: string; reason: string; method: 'STRIPE' | 'MANUAL' },
	): Promise<void> {
		const viaStripe = plan.parts.filter(
			(part) => options.method === 'STRIPE' && part.paymentIntentId !== null,
		);
		const byHand = plan.parts.filter((part) => !viaStripe.includes(part));

		await this.ledger.queueRefunds(
			tx,
			viaStripe.map((part) => ({
				bookingId,
				paymentIntentId: part.paymentIntentId as string,
				amount: part.amountInCents / 100,
				kind: 'full' as const,
				reason: options.reason,
				operationKey: options.operationKey,
			})),
		);

		for (const part of byHand) {
			await this.ledger.recordManualRefund(tx, {
				bookingId,
				paymentIntentId: part.paymentIntentId,
				amountInCents: part.amountInCents,
				reason: `Refunded by an admin outside Stripe: ${options.reason}`,
				operationKey: options.operationKey,
			});
		}
	}

	async settlePlan(
		bookingId: string,
		plan: GuestRefund,
		options: {
			operationKey: string;
			reason: string;
			failureReason: string;
			failureLogSuffix: string;
		},
	): Promise<{ refundedInCents: number | null; failed: boolean }> {
		let refundedInCents: number | null = null;
		let failed = false;

		for (const part of plan.parts) {
			if (!part.paymentIntentId || part.amountInCents <= 0) continue;

			const outcome = await this.settle(
				{ id: bookingId, paymentIntentId: part.paymentIntentId, operationKey: options.operationKey },
				this.refundPlan({
					paymentIntentId: part.paymentIntentId,
					grossInCents: part.amountInCents,
					withholdFee: false,
					idempotencyKey: refundKeyFor(options.operationKey, part.paymentIntentId),
					successReason: options.reason,
					failureReason: options.failureReason,
					failureLogSuffix: options.failureLogSuffix,
				}),
			);

			if (outcome.refundedInCents !== null) {
				refundedInCents = (refundedInCents ?? 0) + outcome.refundedInCents;
			}
			failed = failed || outcome.failed;
		}

		return { refundedInCents, failed };
	}

	async queueCancellation(
		tx: Prisma.TransactionClient,
		booking: { id: string; amount: Prisma.Decimal; quantity: number; paymentIntentId: string | null },
		options: {
			percentage: number;
			withholdFee: boolean;
			reason: string;
			method: 'STRIPE' | 'MANUAL';
		},
	): Promise<QueuedCancellation | null> {
		if (Number(booking.amount) <= 0) return null;
		if (!booking.paymentIntentId && options.method === 'STRIPE') return null;

		const operationKey = `cancel:${booking.id}`;
		const plan = await this.planForBooking(tx, {
			bookingId: booking.id,
			amount: Number(booking.amount),
			quantity: booking.quantity,
			guests: booking.quantity,
			percentage: options.percentage,
			withholdFee: options.withholdFee,
		});
		if (!booking.paymentIntentId && plan.parts.length === 0) return null;

		const queued: QueuedCancellation = {
			bookingId: booking.id,
			paymentIntentId: booking.paymentIntentId,
			operationKey,
			plan,
			withholdFee: options.withholdFee,
			reason: options.reason,
			method: options.method,
		};

		if (plan.paidByCard || options.method === 'MANUAL') {
			await this.queuePlan(tx, booking.id, plan, {
				operationKey,
				reason: options.reason,
				method: options.method,
			});
		} else if (booking.paymentIntentId && plan.grossInCents > 0) {
			await this.ledger.queueRefunds(tx, [
				{
					bookingId: booking.id,
					paymentIntentId: booking.paymentIntentId,
					amount: plan.grossInCents / 100,
					kind: options.withholdFee ? 'withhold-fee' : 'full',
					reason: options.reason,
					operationKey,
				},
			]);
		}

		return queued;
	}

	async settleCancellation(
		queued: QueuedCancellation,
		failureReason: string,
		failureLogSuffix: string,
	): Promise<RefundOutcome> {
		const { plan, operationKey, paymentIntentId } = queued;
		const coveredByFee =
			plan.grossInCents > 0 && plan.netInCents === 0 && plan.feeInCents > 0
				? { grossInCents: plan.grossInCents, feeInCents: plan.feeInCents }
				: null;

		if (queued.method === 'MANUAL') {
			return { refundedInCents: null, failed: false, coveredByFee };
		}

		if (plan.paidByCard) {
			const outcome = await this.settlePlan(queued.bookingId, plan, {
				operationKey,
				reason: queued.reason,
				failureReason,
				failureLogSuffix,
			});

			return { ...outcome, coveredByFee };
		}

		if (!paymentIntentId) return { refundedInCents: null, failed: false, coveredByFee: null };

		return this.settle(
			{ id: queued.bookingId, paymentIntentId, operationKey },
			this.refundPlan({
				paymentIntentId,
				grossInCents: plan.grossInCents,
				withholdFee: queued.withholdFee,
				idempotencyKey: refundKeyFor(operationKey, paymentIntentId),
				successReason: queued.reason,
				failureReason,
				failureLogSuffix,
			}),
		);
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
			idempotencyKey: row.operationKey
				? refundKeyFor(row.operationKey, row.stripePaymentIntentId)
				: `full-refund-${row.bookingId}`,
			successReason: parsed.text,
			failureReason: 'Refund could not be processed at Stripe',
			failureLogSuffix: ' (queued retry)',
		});
	}
}
