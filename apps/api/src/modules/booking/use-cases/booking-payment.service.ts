import { Injectable, Logger } from '@nestjs/common';
import { LEDGER_REASON } from '@event-space/shared';
import { Prisma, type Locale } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import { DEFAULT_LOCALE } from '@infra/mail/mail-strings';
import { StripeService } from '@infra/stripe/stripe.service';
import { StripeBalanceTransaction, StripePaymentIntentRetrieve } from '@infra/stripe/stripe.types';
import { getNextBookingReference } from '../booking.utils';
import { BookingLedgerService } from '../money/booking-ledger.service';
import { BookingRefundService } from '../money/booking-refund.service';
import { BookingNotificationService } from './booking-notification.service';
import { BookingTopUpService } from './booking-top-up.service';

@Injectable()
export class BookingPaymentService {
	private readonly logger = new Logger(BookingPaymentService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly stripe: StripeService,
		private readonly ledger: BookingLedgerService,
		private readonly notifications: BookingNotificationService,
		private readonly topUps: BookingTopUpService,
		private readonly refunds: BookingRefundService,
	) {}

	async reconcilePayment(
		paymentIntentId: string,
		bookingIdHint?: string,
		locale: Locale = DEFAULT_LOCALE,
	) {
		const paymentIntent = await this.stripe.retrievePaymentIntent(paymentIntentId);

		if (this.topUps.isGuestPayment(paymentIntent)) {
			await this.topUps.settle(paymentIntent);
			return null;
		}

		const amountReceived = paymentIntent.amount_received ?? paymentIntent.amount;

		const result = await this.prisma.$transaction(async (tx) => {
			let booking = bookingIdHint
				? await tx.booking.findUnique({
						where: { id: bookingIdHint },
						include: { occurrence: { select: { maxParticipants: true, currentParticipants: true } } },
					})
				: null;

			if (!booking) {
				booking = await tx.booking.findFirst({
					where: { paymentIntentId },
					include: { occurrence: { select: { maxParticipants: true, currentParticipants: true } } },
				});
			}

			if (!booking) {
				this.logger.warn(`Unable to reconcile payment intent ${paymentIntentId}: booking not found`);
				return { action: 'skipped' as const };
			}

			if (!booking.paymentIntentId) {
				await tx.booking.update({
					where: { id: booking.id },
					data: { paymentIntentId },
				});
				booking.paymentIntentId = paymentIntentId;
			}

			if (booking.status === 'CONFIRMED') {
				this.logger.log(`Booking ${booking.id} already confirmed`);
				return { action: 'skipped' as const, booking };
			}

			if (paymentIntent.status === 'succeeded') {
				if (booking.status === 'CANCELLED') {
					const cancelledBooking = await tx.booking.update({
						where: { id: booking.id },
						data: { paymentIntentId },
					});
					await this.queueAutoRefund(
						tx,
						booking.id,
						paymentIntentId,
						amountReceived,
						LEDGER_REASON.PAYMENT_CAPTURED_AFTER_CANCEL,
					);
					return {
						action: 'refund' as const,
						booking: cancelledBooking,
						bookingId: booking.id,
						paymentIntentId,
						amountReceived,
						reason: LEDGER_REASON.PAYMENT_CAPTURED_AFTER_CANCEL,
						idempotencyKey: `auto-refund-${booking.id}`,
					};
				}

				// One payment intent can only fund one confirmation. If an adjustment already
				// settled it, this is a stale intent from an earlier cycle — possibly already
				// refunded — and confirming again would hand out a free booking.
				const settled = await tx.bookingAdjustment.findFirst({
					where: { stripePaymentIntentId: paymentIntentId },
					select: { id: true, bookingId: true, type: true },
				});

				if (settled) {
					this.logger.warn(
						`Refusing to confirm booking ${booking.id}: payment intent ${paymentIntentId} was already settled by ${settled.type} adjustment ${settled.id} (booking ${settled.bookingId})`,
					);
					return { action: 'skipped' as const };
				}

				const reserved = await tx.eventOccurrence.updateMany({
					where: {
						id: booking.occurrenceId,
						currentParticipants: { lte: booking.occurrence.maxParticipants - booking.quantity },
					},
					data: { currentParticipants: { increment: booking.quantity } },
				});

				if (reserved.count === 0) {
					const cancelledBooking = await tx.booking.update({
						where: { id: booking.id },
						data: { status: 'CANCELLED', paymentIntentId },
					});
					await this.queueAutoRefund(
						tx,
						booking.id,
						paymentIntentId,
						amountReceived,
						LEDGER_REASON.NO_SPOTS_LEFT,
					);
					return {
						action: 'refund' as const,
						booking: cancelledBooking,
						bookingId: booking.id,
						paymentIntentId,
						amountReceived,
						reason: LEDGER_REASON.NO_SPOTS_LEFT,
						idempotencyKey: `auto-refund-no-spots-${booking.id}`,
					};
				}

				const referenceNumber = await getNextBookingReference(tx);
				const confirmedBooking = await tx.booking.update({
					where: { id: booking.id },
					data: { status: 'CONFIRMED', paymentIntentId, referenceNumber },
				});

				await this.ledger.recordCharge(tx, {
					bookingId: booking.id,
					paymentIntentId,
					amount: new Prisma.Decimal(booking.amount.toString()),
					reason: LEDGER_REASON.PAYMENT_CAPTURED,
				});

				return { action: 'confirmed' as const, booking: confirmedBooking };
			}

			// requires_payment_method is not terminal: it is the state of a fresh intent the user
			// has not paid yet, and of an intent whose card was declined. The booking stays
			// PENDING so the user can retry, however long that takes.
			if (paymentIntent.status === 'canceled') {
				if (booking.status === 'PENDING') {
					const cancelledBooking = await tx.booking.update({
						where: { id: booking.id },
						data: { status: 'CANCELLED' },
					});

					return { action: 'cancelled' as const, booking: cancelledBooking };
				}

				return { action: 'cancelled' as const, booking };
			}

			return { action: 'pending' as const, booking };
		});

		if (result.action === 'confirmed') {
			await this.recordChargeFee(paymentIntent);
			await this.notifications.sendConfirmation(result.booking.id, locale);
		}

		if (result.action === 'refund') {
			let refundFailed = false;

			try {
				await this.ledger.recordChargeIfMissing({
					bookingId: result.bookingId,
					paymentIntentId: result.paymentIntentId,
					amountInCents: result.amountReceived,
					reason: LEDGER_REASON.PAYMENT_CAPTURED_THEN_REFUNDED,
				});

				const outcome = await this.refunds.settle(
					{ id: result.bookingId, paymentIntentId: result.paymentIntentId },
					this.refunds.refundPlan({
						paymentIntentId: result.paymentIntentId,
						grossInCents: result.amountReceived,
						withholdFee: false,
						idempotencyKey: result.idempotencyKey,
						successReason: result.reason,
						failureReason: 'Refund could not be processed at Stripe',
						failureLogSuffix: ' (automatic)',
					}),
				);
				refundFailed = outcome.failed;
			} catch (e) {
				refundFailed = true;
				this.logger.error(`Failed to auto-refund booking ${result.bookingId}`, e as Error);
			}

			if (result.reason === LEDGER_REASON.NO_SPOTS_LEFT) {
				await this.notifications.sendNoSeatsLeft(result.bookingId, locale, refundFailed);
			}
		}

		return result.action === 'skipped' ? null : result.booking;
	}

	// Queued inside the same transaction that cancels the booking, so a refund that fails at
	// Stripe is picked up by the retry job instead of living only in a log line.
	private queueAutoRefund(
		tx: Prisma.TransactionClient,
		bookingId: string,
		paymentIntentId: string,
		amountReceived: number,
		reason: string,
	) {
		return this.ledger.queueRefunds(tx, [
			{ bookingId, paymentIntentId, amount: amountReceived / 100, kind: 'full', reason },
		]);
	}

	private async recordChargeFee(paymentIntent: StripePaymentIntentRetrieve): Promise<void> {
		try {
			if (!paymentIntent.latest_charge) return;

			const charge = await this.stripe.getCharge(paymentIntent.latest_charge as string);
			const balanceTx = charge.balance_transaction as StripeBalanceTransaction | null;
			if (!balanceTx || typeof balanceTx !== 'object' || typeof balanceTx.fee !== 'number') return;

			await this.ledger.attachFee(paymentIntent.id, balanceTx.fee);
		} catch (error) {
			this.logger.warn(`Could not record Stripe fee for ${paymentIntent.id}`, error as Error);
		}
	}
}
