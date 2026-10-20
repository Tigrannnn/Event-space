import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { StripeService } from '@infra/stripe/stripe.service';
import {
	CANCELABLE_PAYMENT_INTENT_STATUSES,
	type CancelablePaymentIntentStatus,
	type StripeBalanceTransaction,
} from '@infra/stripe/stripe.types';
import { AppException } from '@shared';
import { AppErrorCode } from '@event-space/shared';
import type { AdminCancelBookingData } from '@event-space/shared';
import { calculateRefundPercentage } from '@modules/booking/booking.utils';
import { BookingLedgerService } from '@modules/booking/money/booking-ledger.service';
import { BookingRefundService } from '@modules/booking/money/booking-refund.service';

type RefundType = NonNullable<AdminCancelBookingData['refundType']>;

@Injectable()
export class AdminBookingCancellationService {
	private readonly logger = new Logger(AdminBookingCancellationService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly stripe: StripeService,
		private readonly ledger: BookingLedgerService,
		private readonly refunds: BookingRefundService,
	) {}

	async cancel(adminId: string, bookingId: string, data: AdminCancelBookingData) {
		const { refundType = 'RULES', reason } = data;

		const { booking, occurrence, event, alreadyCancelled } = await this.markCancelled(bookingId);

		const respond = (processed: boolean, message: string) => ({
			booking: { ...booking, amount: Number(booking.amount), status: 'CANCELLED' },
			refundType,
			reason: reason ?? null,
			processed,
			message,
		});

		const paymentIntentId = booking.paymentIntentId;

		if (!paymentIntentId || Number(booking.amount) === 0) {
			return respond(false, 'Booking cancelled without payment refund processing.');
		}

		// A repeated click must not refund twice or turn a finished refund back into "pending".
		// A cancellation whose refund never happened or failed stays retryable.
		if (alreadyCancelled && (await this.ledger.hasActiveRefund(booking.id))) {
			return respond(false, 'Booking was already cancelled and its refund is recorded.');
		}

		if (refundType === 'MANUAL') {
			const note = reason ? `: ${reason}` : '';
			await this.ledger.recordRefundWithoutMoney({
				bookingId: booking.id,
				paymentIntentId,
				status: 'PENDING',
				reason: `Manual refund requested by admin ${adminId}${note}`,
			});

			return respond(false, 'Booking cancelled. Refund will be handled manually.');
		}

		if (!event) {
			this.logger.warn(
				`Event not found for booking ${bookingId} during admin cancel — skipping refund`,
			);
			return respond(false, 'Booking cancelled without refund because event data is missing.');
		}

		const adminReason = `Admin cancellation${reason ? `: ${reason}` : ''}`;

		const percentage =
			refundType === 'FULL'
				? 100
				: calculateRefundPercentage(
						new Date(),
						new Date(occurrence?.date ?? new Date()),
						event.cancellationRules,
					);

		if (refundType === 'RULES') await this.refunds.fillMissingFees(booking.id);

		const allocation = await this.prisma.$transaction(async (tx) => {
			const plan = await this.refunds.planCancellation(tx, {
				bookingId: booking.id,
				amount: Number(booking.amount),
				quantity: booking.quantity,
				percentage,
				withholdFee: refundType === 'RULES',
			});

			if (plan) {
				await this.refunds.queueAllocation(tx, booking.id, plan, {
					operationKey: `cancel:${booking.id}`,
					reason: adminReason,
					cashStatus: 'SUCCEEDED',
				});
			}

			return plan;
		});

		if (allocation) {
			const outcome = await this.refunds.settleAllocation(booking.id, allocation, {
				operationKey: `cancel:${booking.id}`,
				reason: adminReason,
				failureReason: 'Refund could not be processed at Stripe (admin cancellation)',
				failureLogSuffix: ' (admin cancellation)',
			});

			return respond(outcome.refundedInCents !== null || outcome.failed, this.messageFor(refundType));
		}

		const settlement = await this.settleWithStripe({
			bookingId,
			paymentIntentId,
			amount: Number(booking.amount),
			refundType,
			tourDate: occurrence?.date,
			rules: event.cancellationRules,
		});

		if (settlement.paidInCents !== null) {
			await this.ledger.recordChargeIfMissing({
				bookingId: booking.id,
				paymentIntentId,
				amountInCents: settlement.paidInCents,
				reason: 'Payment captured, recorded when an admin cancelled the booking',
			});
		}

		// Only money that moved, or a genuine Stripe failure, is worth a ledger row. Cancelling an
		// intent nobody paid, or a rule that returns nothing, leaves the ledger as it was.
		if (settlement.refund) {
			await this.ledger.recordRefund({
				bookingId: booking.id,
				paymentIntentId,
				amountInCents: settlement.refund.amount,
				stripeRefundId: settlement.refund.id,
				reason: adminReason,
				overwriteReason: true,
				feeWithheldInCents: settlement.feeWithheldInCents,
			});
		} else if (settlement.failed) {
			await this.ledger.recordFailedRefund({
				bookingId: booking.id,
				paymentIntentId,
				reason: adminReason,
			});
		} else if (settlement.coveredByFee) {
			const { grossInCents, feeInCents } = settlement.coveredByFee;
			await this.ledger.recordRefundWithoutMoney({
				bookingId: booking.id,
				paymentIntentId,
				status: 'SUCCEEDED',
				reason:
					`${adminReason}. Refund by the cancellation rules was ${(grossInCents / 100).toFixed(2)} AMD, ` +
					`the Stripe fee of ${(feeInCents / 100).toFixed(2)} AMD covers it entirely`,
			});

			return respond(
				true,
				'Booking cancelled. The refund by the cancellation rules is covered entirely by the payment provider fee, so nothing was refunded.',
			);
		}

		return respond(settlement.refund !== null || settlement.failed, this.messageFor(refundType));
	}

	private async markCancelled(bookingId: string) {
		return this.prisma.$transaction(async (tx) => {
			const current = await tx.booking.findUnique({
				where: { id: bookingId },
				include: {
					occurrence: {
						include: { event: { include: { cancellationRules: true, translations: true } } },
					},
				},
			});

			if (!current) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);

			const context = { occurrence: current.occurrence, event: current.occurrence?.event };

			if (current.status === 'CANCELLED') {
				return { booking: current, alreadyCancelled: true, ...context };
			}

			if (current.status === 'CONFIRMED') {
				await tx.eventOccurrence.updateMany({
					where: { id: current.occurrenceId, currentParticipants: { gte: current.quantity } },
					data: { currentParticipants: { decrement: current.quantity } },
				});
			}

			const updated = await tx.booking.update({
				where: { id: bookingId },
				data: { status: 'CANCELLED' },
			});

			return { booking: updated, alreadyCancelled: false, ...context };
		});
	}

	private async settleWithStripe(params: {
		bookingId: string;
		paymentIntentId: string;
		amount: number;
		refundType: RefundType;
		tourDate?: Date;
		rules: Parameters<typeof calculateRefundPercentage>[2];
	}): Promise<{
		refund: { amount: number; id: string } | null;
		failed: boolean;
		coveredByFee: { grossInCents: number; feeInCents: number } | null;
		paidInCents: number | null;
		feeWithheldInCents: number;
	}> {
		const { paymentIntentId, refundType } = params;
		let paidInCents: number | null = null;

		try {
			const paymentIntent = await this.stripe.retrievePaymentIntent(paymentIntentId);

			if (paymentIntent.status === 'succeeded') {
				paidInCents = paymentIntent.amount_received ?? paymentIntent.amount;
				const baseInCents = Math.round(params.amount * 100);
				const refundPercentage = calculateRefundPercentage(
					new Date(),
					new Date(params.tourDate ?? new Date()),
					params.rules,
				);
				const grossInCents =
					refundType === 'FULL' ? baseInCents : Math.round((baseInCents * refundPercentage) / 100);
				let refundInCents = grossInCents;

				if (refundType !== 'FULL' && grossInCents > 0) {
					const charge = await this.stripe.getCharge(paymentIntent.latest_charge as string);
					const totalFeeInCents = (charge.balance_transaction as StripeBalanceTransaction).fee;
					const alreadyWithheld = await this.ledger.feeWithheldInCents(paymentIntentId);
					const feeInCents = Math.max(0, totalFeeInCents - alreadyWithheld);
					refundInCents = grossInCents - feeInCents;

					if (refundInCents <= 0) {
						return {
							refund: null,
							failed: false,
							coveredByFee: { grossInCents, feeInCents },
							paidInCents,
							feeWithheldInCents: 0,
						};
					}
				}

				if (refundInCents > 0) {
					const refund = await this.stripe.refund(
						paymentIntentId,
						`admin-refund-${paymentIntentId}-${refundInCents}`,
						refundInCents,
					);
					return {
						refund: { amount: refund.amount, id: refund.id },
						failed: false,
						coveredByFee: null,
						paidInCents,
						feeWithheldInCents: Math.max(0, grossInCents - refund.amount),
					};
				}
			} else if (
				CANCELABLE_PAYMENT_INTENT_STATUSES.includes(
					paymentIntent.status as CancelablePaymentIntentStatus,
				)
			) {
				await this.stripe.cancelPaymentIntent(paymentIntentId, `admin-cancel-${paymentIntentId}`);
			}

			return { refund: null, failed: false, coveredByFee: null, paidInCents, feeWithheldInCents: 0 };
		} catch (stripeError) {
			this.logger.error(`Admin refund failed for booking ${params.bookingId}:`, stripeError);
			return { refund: null, failed: true, coveredByFee: null, paidInCents, feeWithheldInCents: 0 };
		}
	}

	private messageFor(refundType: RefundType): string {
		if (refundType === 'FULL') return 'Booking cancelled and refund processed.';
		if (refundType === 'RULES') {
			return 'Booking cancelled and refund processed according to cancellation rules.';
		}
		return 'Booking cancelled. Refund will be handled manually.';
	}
}
