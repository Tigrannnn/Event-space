import { randomUUID } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma, type ModificationStatus } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import { StripeService } from '@infra/stripe/stripe.service';
import type { StripePaymentIntentRetrieve } from '@infra/stripe/stripe.types';
import {
	AppErrorCode,
	type QuantityPaymentResult,
	type QuantityQuoteRequest,
	type StartQuantityPayment,
} from '@event-space/shared';
import { AppException } from '@shared';
import { reserveSeats } from '../occurrence-seats';
import { BookingLedgerService } from '../money/booking-ledger.service';
import { BookingRefundService } from '../money/booking-refund.service';
import { BookingNotificationService } from './booking-notification.service';
import { BookingQuantityService } from './booking-quantity.service';

const REUSABLE_STATUSES = ['requires_payment_method', 'requires_confirmation', 'requires_action'];
const PAYMENT_WINDOW_MS = 2 * 60 * 60 * 1000;
const LOST_START_MS = 5 * 60 * 1000;
const SWEEP_MIN_AGE_MS = 60 * 1000;
const SWEEP_BATCH = 50;

class AlreadyHandled extends Error {}
class Rejected extends Error {}

const toCents = (value: Prisma.Decimal | number): number => Math.round(Number(value) * 100);

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

		const open = await this.prisma.bookingModification.findMany({
			where: { bookingId, status: 'PENDING_PAYMENT' },
		});

		for (const modification of open) {
			const sameChange =
				modification.fromQuantity === quote.currentQuantity &&
				modification.toQuantity === quote.newQuantity &&
				toCents(modification.amount) === quote.dueInCents;

			if (sameChange && modification.paymentIntentId) {
				const intent = await this.stripe.retrievePaymentIntent(modification.paymentIntentId);
				if (REUSABLE_STATUSES.includes(intent.status) && intent.client_secret) {
					return { modificationId: modification.id, clientSecret: intent.client_secret, quote };
				}
			}

			await this.abandon(modification);
		}

		const modificationId = randomUUID();
		await this.prisma.bookingModification.create({
			data: {
				id: modificationId,
				bookingId,
				fromQuantity: quote.currentQuantity,
				toQuantity: quote.newQuantity,
				amount: new Prisma.Decimal((quote.dueInCents / 100).toFixed(2)),
			},
		});

		try {
			const intent = await this.stripe.createPaymentIntent(quote.dueInCents / 100, 'AMD', {
				bookingId,
				userId,
				modificationId,
				kind: 'guests',
			});

			await this.prisma.bookingModification.update({
				where: { id: modificationId },
				data: { paymentIntentId: intent.id },
			});

			return { modificationId, clientSecret: intent.client_secret as string, quote };
		} catch (error) {
			await this.prisma.bookingModification.delete({ where: { id: modificationId } });

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

	async handles(paymentIntentId: string): Promise<boolean> {
		const found = await this.prisma.bookingModification.findUnique({
			where: { paymentIntentId },
			select: { id: true },
		});

		return found !== null;
	}

	async settle(paymentIntentId: string): Promise<ModificationStatus | null> {
		const modification = await this.prisma.bookingModification.findUnique({
			where: { paymentIntentId },
		});

		if (!modification) return null;
		if (modification.status !== 'PENDING_PAYMENT') return modification.status;

		const intent = await this.stripe.retrievePaymentIntent(paymentIntentId);

		if (intent.status === 'succeeded') return this.applyPaid(modification, intent);

		if (intent.status === 'canceled') {
			await this.close(modification.id, 'CANCELLED', 'The payment was cancelled');
			return 'CANCELLED';
		}

		if (Date.now() - modification.createdAt.getTime() >= PAYMENT_WINDOW_MS) {
			return this.expire(modification);
		}

		return 'PENDING_PAYMENT';
	}

	async reconcile(
		userId: string,
		bookingId: string,
		modificationId: string,
	): Promise<QuantityPaymentResult> {
		const modification = await this.prisma.bookingModification.findFirst({
			where: { id: modificationId, bookingId, booking: { userId } },
		});

		if (!modification) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);

		const status = modification.paymentIntentId
			? ((await this.settle(modification.paymentIntentId)) ?? modification.status)
			: modification.status;

		return { modificationId, status };
	}

	async sweep(): Promise<number> {
		const now = Date.now();
		const stale = await this.prisma.bookingModification.findMany({
			where: {
				status: 'PENDING_PAYMENT',
				createdAt: { lt: new Date(now - SWEEP_MIN_AGE_MS) },
			},
			orderBy: { createdAt: 'asc' },
			take: SWEEP_BATCH,
		});

		let handled = 0;

		for (const modification of stale) {
			try {
				if (!modification.paymentIntentId) {
					if (now - modification.createdAt.getTime() >= LOST_START_MS) {
						await this.close(modification.id, 'CANCELLED', 'The payment was never started');
						handled += 1;
					}
					continue;
				}

				await this.settle(modification.paymentIntentId);
				handled += 1;
			} catch (error) {
				this.logger.error(
					`Could not settle the payment for modification ${modification.id}`,
					error as Error,
				);
			}
		}

		return handled;
	}

	private async applyPaid(
		modification: {
			id: string;
			bookingId: string;
			fromQuantity: number;
			toQuantity: number;
			amount: Prisma.Decimal;
		},
		intent: StripePaymentIntentRetrieve,
	): Promise<ModificationStatus> {
		const extraInCents = toCents(modification.amount);
		const receivedInCents = intent.amount_received ?? intent.amount;

		if (receivedInCents !== extraInCents) {
			return this.rejectAndRefund(modification, intent, 'The payment does not match the extra amount');
		}

		try {
			await this.prisma.$transaction(async (tx) => {
				const claimed = await tx.bookingModification.updateMany({
					where: { id: modification.id, status: 'PENDING_PAYMENT' },
					data: { status: 'APPLIED', appliedAt: new Date() },
				});
				if (claimed.count === 0) throw new AlreadyHandled();

				const booking = await tx.booking.findUnique({
					where: { id: modification.bookingId },
					include: { occurrence: true },
				});

				if (!booking?.occurrence) throw new Rejected('The booking no longer exists');
				if (booking.status !== 'CONFIRMED') throw new Rejected('The booking is not confirmed any more');
				if (booking.checkedInAt) throw new Rejected('The guests have already been checked in');
				if (booking.quantity !== modification.fromQuantity) {
					throw new Rejected('The booking was changed while the payment was made');
				}
				if (booking.occurrence.status !== 'ACTIVE' || booking.occurrence.date.getTime() <= Date.now()) {
					throw new Rejected('The tour is no longer open');
				}

				await reserveSeats(tx, booking.occurrence, modification.toQuantity - modification.fromQuantity);

				const updated = await tx.booking.updateMany({
					where: {
						id: booking.id,
						status: 'CONFIRMED',
						quantity: modification.fromQuantity,
						checkedInAt: null,
					},
					data: {
						quantity: modification.toQuantity,
						amount: new Prisma.Decimal(((toCents(booking.amount) + extraInCents) / 100).toFixed(2)),
					},
				});
				if (updated.count === 0)
					throw new Rejected('The booking was changed while the payment was made');

				await this.ledger.recordCharge(tx, {
					bookingId: booking.id,
					paymentIntentId: intent.id,
					amount: new Prisma.Decimal((extraInCents / 100).toFixed(2)),
					reason: 'Paid for added guests',
				});
			});
		} catch (error) {
			if (error instanceof AlreadyHandled) {
				const current = await this.prisma.bookingModification.findUnique({
					where: { id: modification.id },
					select: { status: true },
				});
				return current?.status ?? 'APPLIED';
			}

			if (error instanceof Rejected) {
				return this.rejectAndRefund(modification, intent, error.message);
			}

			if (error instanceof AppException) {
				return this.rejectAndRefund(modification, intent, 'There are not enough free spots');
			}

			throw error;
		}

		await this.refunds.fillMissingFees(modification.bookingId);
		await this.tellClientAdded(modification, extraInCents);

		return 'APPLIED';
	}

	private async rejectAndRefund(
		modification: { id: string; bookingId: string },
		intent: StripePaymentIntentRetrieve,
		reason: string,
	): Promise<ModificationStatus> {
		const receivedInCents = intent.amount_received ?? intent.amount;
		const operationKey = `mod-fail:${modification.id}`;

		await this.ledger.recordChargeIfMissing({
			bookingId: modification.bookingId,
			paymentIntentId: intent.id,
			amountInCents: receivedInCents,
			reason: 'Payment captured for added guests, then refunded',
		});

		const marked = await this.prisma.$transaction(async (tx) => {
			const closed = await tx.bookingModification.updateMany({
				where: { id: modification.id, status: 'PENDING_PAYMENT' },
				data: { status: 'FAILED', failureReason: reason },
			});
			if (closed.count === 0) return false;

			await this.ledger.queueRefunds(tx, [
				{
					bookingId: modification.bookingId,
					paymentIntentId: intent.id,
					amount: receivedInCents / 100,
					kind: 'full',
					reason: `Guests could not be added: ${reason}`,
					operationKey,
				},
			]);

			return true;
		});

		if (marked) {
			await this.refunds.settle(
				{ id: modification.bookingId, paymentIntentId: intent.id, operationKey },
				this.refunds.refundPlan({
					paymentIntentId: intent.id,
					grossInCents: receivedInCents,
					withholdFee: false,
					idempotencyKey: operationKey,
					successReason: `Guests could not be added: ${reason}`,
					failureReason: 'Refund could not be processed at Stripe (guests not added)',
					failureLogSuffix: ' (guests not added)',
				}),
			);
			await this.tellClientNotAdded(modification, receivedInCents);
		}

		return 'FAILED';
	}

	private async abandon(modification: { id: string; paymentIntentId: string | null }) {
		if (modification.paymentIntentId) {
			try {
				await this.stripe.cancelPaymentIntent(
					modification.paymentIntentId,
					`abandon-${modification.id}`,
				);
			} catch (error) {
				const intent = await this.stripe
					.retrievePaymentIntent(modification.paymentIntentId)
					.catch(() => null);

				if (intent?.status === 'succeeded') {
					await this.settle(modification.paymentIntentId);
					return;
				}

				this.logger.warn(
					`Could not cancel payment intent ${modification.paymentIntentId}`,
					error as Error,
				);
			}
		}

		await this.close(modification.id, 'CANCELLED', 'Replaced by a newer request');
	}

	private async expire(modification: {
		id: string;
		paymentIntentId: string | null;
	}): Promise<ModificationStatus> {
		if (modification.paymentIntentId) {
			try {
				await this.stripe.cancelPaymentIntent(
					modification.paymentIntentId,
					`expire-${modification.id}`,
				);
			} catch (error) {
				const intent = await this.stripe
					.retrievePaymentIntent(modification.paymentIntentId)
					.catch(() => null);

				if (intent?.status === 'succeeded') {
					return (await this.settle(modification.paymentIntentId)) ?? 'PENDING_PAYMENT';
				}

				this.logger.warn(
					`Could not cancel payment intent ${modification.paymentIntentId}`,
					error as Error,
				);
			}
		}

		await this.close(modification.id, 'EXPIRED', 'The payment was not made in time');
		return 'EXPIRED';
	}

	private async close(id: string, status: ModificationStatus, reason: string): Promise<boolean> {
		const result = await this.prisma.bookingModification.updateMany({
			where: { id, status: 'PENDING_PAYMENT' },
			data: { status, failureReason: reason },
		});

		return result.count > 0;
	}

	private async emailContext(bookingId: string) {
		return this.prisma.booking.findUnique({
			where: { id: bookingId },
			include: {
				user: true,
				occurrence: { include: { event: { include: { translations: true } } } },
			},
		});
	}

	private async tellClientAdded(
		modification: { bookingId: string; fromQuantity: number; toQuantity: number },
		extraInCents: number,
	): Promise<void> {
		const booking = await this.emailContext(modification.bookingId);
		if (!booking?.occurrence) return;

		await this.notifications.sendQuantityChanged({
			booking: { referenceNumber: booking.referenceNumber, brandHost: booking.brandHost },
			event: { translations: booking.occurrence.event?.translations ?? [] },
			occurrence: { date: booking.occurrence.date },
			user: { email: booking.user.email, name: booking.user.name, locale: booking.user.locale },
			oldQuantity: modification.fromQuantity,
			newQuantity: modification.toQuantity,
			newAmount: Number(booking.amount),
			byOrganiser: false,
			extra: { kind: 'paidByCard', amount: extraInCents / 100 },
		});
	}

	private async tellClientNotAdded(
		modification: { bookingId: string },
		refundedInCents: number,
	): Promise<void> {
		const booking = await this.emailContext(modification.bookingId);
		if (!booking?.occurrence) return;

		await this.notifications.sendQuantityNotAdded({
			booking: { referenceNumber: booking.referenceNumber, brandHost: booking.brandHost },
			event: { translations: booking.occurrence.event?.translations ?? [] },
			occurrence: { date: booking.occurrence.date },
			user: { email: booking.user.email, name: booking.user.name, locale: booking.user.locale },
			refundAmount: refundedInCents / 100,
		});
	}
}
