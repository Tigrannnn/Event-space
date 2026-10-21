import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import { StripeService } from '@infra/stripe/stripe.service';
import type { StripePaymentIntentRetrieve } from '@infra/stripe/stripe.types';
import {
	AppErrorCode,
	type QuantityPaymentResult,
	type QuantityPaymentStatus,
	type QuantityQuoteRequest,
	type StartQuantityPayment,
} from '@event-space/shared';
import { AppException } from '@shared';
import { reserveSeats } from '../occurrence-seats';
import { BookingLedgerService } from '../money/booking-ledger.service';
import { BookingRefundService, refundKeyFor } from '../money/booking-refund.service';
import { BookingNotificationService } from './booking-notification.service';
import { BookingQuantityService } from './booking-quantity.service';

const GUEST_PAYMENT = 'guests';
const FAILED_KEY = 'guests-fail';

interface GuestPayment {
	bookingId: string;
	userId: string;
	fromQuantity: number;
	toQuantity: number;
	amountInCents: number;
}

class Rejected extends Error {}

const isUniqueViolation = (error: unknown) =>
	error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';

@Injectable()
export class BookingTopUpService {
	private readonly logger = new Logger(BookingTopUpService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly stripe: StripeService,
		private readonly ledger: BookingLedgerService,
		private readonly refunds: BookingRefundService,
		private readonly quantities: BookingQuantityService,
		private readonly notifications: BookingNotificationService,
	) {}

	async start(
		userId: string,
		bookingId: string,
		request: QuantityQuoteRequest,
	): Promise<StartQuantityPayment> {
		const quote = await this.quantities.quote({ kind: 'client', userId }, bookingId, request);

		if (quote.direction !== 'INCREASE') {
			throw new AppException(AppErrorCode.QUANTITY_SETTLEMENT_INVALID);
		}

		try {
			const intent = await this.stripe.createPaymentIntent(quote.dueInCents / 100, 'AMD', {
				kind: GUEST_PAYMENT,
				bookingId,
				userId,
				fromQuantity: String(quote.currentQuantity),
				toQuantity: String(quote.newQuantity),
				amountInCents: String(quote.dueInCents),
			});

			return { paymentIntentId: intent.id, clientSecret: intent.client_secret as string, quote };
		} catch (error) {
			if (
				error &&
				typeof error === 'object' &&
				'type' in error &&
				(error as { type: string }).type === 'StripeConnectionError'
			) {
				throw new AppException(AppErrorCode.PAYMENT_SERVICE_UNAVAILABLE);
			}

			throw error;
		}
	}

	isGuestPayment(intent: { metadata?: Record<string, string> | null }): boolean {
		return intent.metadata?.kind === GUEST_PAYMENT;
	}

	async settle(intent: StripePaymentIntentRetrieve): Promise<QuantityPaymentStatus> {
		const payment = this.readPayment(intent);
		if (!payment) return 'CANCELLED';

		if (intent.status === 'succeeded') return this.applyPaid(payment, intent);
		if (intent.status === 'canceled') return 'CANCELLED';

		return 'PENDING';
	}

	async reconcile(
		userId: string,
		bookingId: string,
		paymentIntentId: string,
	): Promise<QuantityPaymentResult> {
		const intent = await this.stripe.retrievePaymentIntent(paymentIntentId);
		const payment = this.readPayment(intent);

		if (!payment || payment.bookingId !== bookingId || payment.userId !== userId) {
			throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
		}

		return { paymentIntentId, status: await this.settle(intent) };
	}

	async sweep(since: Date): Promise<number> {
		const query = `metadata['kind']:'${GUEST_PAYMENT}' AND status:'succeeded' AND created>${Math.floor(
			since.getTime() / 1000,
		)}`;
		const intents = await this.stripe.searchPaymentIntents(query);

		let handled = 0;
		for (const intent of intents) {
			try {
				await this.settle(intent);
				handled += 1;
			} catch (error) {
				this.logger.error(`Could not settle guest payment ${intent.id}`, error as Error);
			}
		}

		return handled;
	}

	private readPayment(intent: StripePaymentIntentRetrieve): GuestPayment | null {
		const metadata = intent.metadata ?? {};
		if (metadata.kind !== GUEST_PAYMENT) return null;

		const payment = {
			bookingId: metadata.bookingId,
			userId: metadata.userId,
			fromQuantity: Number(metadata.fromQuantity),
			toQuantity: Number(metadata.toQuantity),
			amountInCents: Number(metadata.amountInCents),
		};

		const valid =
			Boolean(payment.bookingId) &&
			Boolean(payment.userId) &&
			Number.isInteger(payment.fromQuantity) &&
			Number.isInteger(payment.toQuantity) &&
			payment.toQuantity > payment.fromQuantity &&
			Number.isInteger(payment.amountInCents);

		return valid ? payment : null;
	}

	private async outcome(paymentIntentId: string): Promise<QuantityPaymentStatus | null> {
		const rows = await this.prisma.bookingAdjustment.findMany({
			where: { stripePaymentIntentId: paymentIntentId },
			select: { type: true, operationKey: true },
		});

		if (rows.some((row) => row.type === 'REFUND' && row.operationKey === FAILED_KEY)) return 'FAILED';
		if (rows.some((row) => row.type === 'CHARGE')) return 'APPLIED';

		return null;
	}

	private async applyPaid(
		payment: GuestPayment,
		intent: StripePaymentIntentRetrieve,
	): Promise<QuantityPaymentStatus> {
		const known = await this.outcome(intent.id);
		if (known) return known;

		const receivedInCents = intent.amount_received ?? intent.amount;
		if (receivedInCents !== payment.amountInCents) {
			return this.rejectAndRefund(payment, intent, 'The payment does not match the extra amount');
		}

		let newAmount = 0;

		try {
			await this.prisma.$transaction(async (tx) => {
				const booking = await tx.booking.findUnique({
					where: { id: payment.bookingId },
					include: { occurrence: true },
				});

				if (!booking?.occurrence) throw new Rejected('The booking no longer exists');
				if (booking.status !== 'CONFIRMED') throw new Rejected('The booking is not confirmed any more');
				if (booking.checkedInAt) throw new Rejected('The guests have already been checked in');
				if (booking.quantity !== payment.fromQuantity) {
					throw new Rejected('The booking was changed while the payment was made');
				}
				if (booking.occurrence.status !== 'ACTIVE' || booking.occurrence.date.getTime() <= Date.now()) {
					throw new Rejected('The tour is no longer open');
				}

				const spotsLeft = booking.occurrence.maxParticipants - booking.occurrence.currentParticipants;
				if (payment.toQuantity - payment.fromQuantity > spotsLeft) {
					throw new Rejected('There are not enough free spots');
				}

				await reserveSeats(tx, booking.occurrence, payment.toQuantity - payment.fromQuantity);

				newAmount = (Math.round(Number(booking.amount) * 100) + payment.amountInCents) / 100;

				const updated = await tx.booking.updateMany({
					where: {
						id: booking.id,
						status: 'CONFIRMED',
						quantity: payment.fromQuantity,
						checkedInAt: null,
					},
					data: {
						quantity: payment.toQuantity,
						amount: new Prisma.Decimal(newAmount.toFixed(2)),
					},
				});
				if (updated.count === 0) {
					throw new Rejected('The booking was changed while the payment was made');
				}

				await this.ledger.recordCharge(tx, {
					bookingId: booking.id,
					paymentIntentId: intent.id,
					amount: new Prisma.Decimal((payment.amountInCents / 100).toFixed(2)),
					reason: 'Paid for added guests',
				});
			});
		} catch (error) {
			if (isUniqueViolation(error)) return (await this.outcome(intent.id)) ?? 'APPLIED';
			if (error instanceof Rejected) return this.rejectAndRefund(payment, intent, error.message);
			if (error instanceof AppException) {
				return this.rejectAndRefund(payment, intent, 'There are not enough free spots');
			}
			throw error;
		}

		await this.refunds.fillMissingFees(payment.bookingId);
		await this.tellClient(payment, { kind: 'added', newAmount });

		return 'APPLIED';
	}

	private async rejectAndRefund(
		payment: GuestPayment,
		intent: StripePaymentIntentRetrieve,
		reason: string,
	): Promise<QuantityPaymentStatus> {
		const receivedInCents = intent.amount_received ?? intent.amount;
		const refundReason = `Guests could not be added: ${reason}`;

		try {
			await this.prisma.$transaction(async (tx) => {
				await this.ledger.recordCharge(tx, {
					bookingId: payment.bookingId,
					paymentIntentId: intent.id,
					amount: new Prisma.Decimal((receivedInCents / 100).toFixed(2)),
					reason: 'Payment captured for added guests, then refunded',
				});

				await this.ledger.queueRefunds(tx, [
					{
						bookingId: payment.bookingId,
						paymentIntentId: intent.id,
						amount: receivedInCents / 100,
						kind: 'full',
						reason: refundReason,
						operationKey: FAILED_KEY,
					},
				]);
			});
		} catch (error) {
			if (isUniqueViolation(error)) return (await this.outcome(intent.id)) ?? 'FAILED';
			throw error;
		}

		await this.refunds.settle(
			{ id: payment.bookingId, paymentIntentId: intent.id, operationKey: FAILED_KEY },
			this.refunds.refundPlan({
				paymentIntentId: intent.id,
				grossInCents: receivedInCents,
				withholdFee: false,
				idempotencyKey: refundKeyFor(FAILED_KEY, intent.id),
				successReason: refundReason,
				failureReason: 'Refund could not be processed at Stripe (guests not added)',
				failureLogSuffix: ' (guests not added)',
			}),
		);

		await this.tellClient(payment, { kind: 'notAdded', refundedInCents: receivedInCents });

		return 'FAILED';
	}

	private async tellClient(
		payment: GuestPayment,
		result: { kind: 'added'; newAmount: number } | { kind: 'notAdded'; refundedInCents: number },
	): Promise<void> {
		const booking = await this.prisma.booking.findUnique({
			where: { id: payment.bookingId },
			include: {
				user: true,
				occurrence: { include: { event: { include: { translations: true } } } },
			},
		});
		if (!booking?.occurrence) return;

		const common = {
			booking: { referenceNumber: booking.referenceNumber, brandHost: booking.brandHost },
			event: { translations: booking.occurrence.event?.translations ?? [] },
			occurrence: { date: booking.occurrence.date },
			user: { email: booking.user.email, name: booking.user.name, locale: booking.user.locale },
		};

		if (result.kind === 'added') {
			await this.notifications.sendQuantityChanged({
				...common,
				oldQuantity: payment.fromQuantity,
				newQuantity: payment.toQuantity,
				newAmount: result.newAmount,
				byOrganiser: false,
				extra: { kind: 'paidByCard', amount: payment.amountInCents / 100 },
			});
			return;
		}

		await this.notifications.sendQuantityNotAdded({
			...common,
			refundAmount: result.refundedInCents / 100,
		});
	}
}
