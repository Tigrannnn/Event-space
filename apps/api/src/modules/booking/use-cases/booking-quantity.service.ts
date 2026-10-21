import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { Prisma, type Locale, type PaymentMethod } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import {
	AppErrorCode,
	type ChangeQuantityData,
	type QuantityQuote,
	type QuantityQuoteRequest,
	type RefundMethod,
} from '@event-space/shared';
import { AppException } from '@shared';
import { calculateRefundPercentage } from '../booking.utils';
import { releaseSeats } from '../occurrence-seats';
import { BookingRefundService } from '../money/booking-refund.service';
import type { GuestRefund } from '../money/refund-allocation';
import { BookingNotificationService } from './booking-notification.service';

export type QuantityActor = { kind: 'client'; userId: string } | { kind: 'admin' };

interface QuantityState {
	booking: {
		id: string;
		userId: string;
		status: string;
		quantity: number;
		amount: Prisma.Decimal;
		occurrenceId: string;
		checkedInAt: Date | null;
		referenceNumber: number | null;
		brandHost: string | null;
		paymentMethod: PaymentMethod;
	};
	user: { email: string | null; name: string; locale: Locale | null };
	translations: { locale: Locale; title: string }[];
	occurrence: {
		id: string;
		date: Date;
		maxParticipants: number;
		currentParticipants: number;
		rules: Parameters<typeof calculateRefundPercentage>[2];
	};
}

type Db = Pick<Prisma.TransactionClient, 'booking' | 'bookingAdjustment'>;

const toCents = (value: Prisma.Decimal | number): number => Math.round(Number(value) * 100);

@Injectable()
export class BookingQuantityService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly refunds: BookingRefundService,
		private readonly notifications: BookingNotificationService,
	) {}

	async quote(
		actor: QuantityActor,
		bookingId: string,
		request: QuantityQuoteRequest,
	): Promise<QuantityQuote> {
		const state = await this.load(this.prisma, bookingId);
		const { quote } = await this.build(actor, state, request, this.prisma);
		return quote;
	}

	async change(actor: QuantityActor, bookingId: string, data: ChangeQuantityData) {
		const owner = await this.assertAllowed(actor, bookingId);
		await this.refunds.prepare(bookingId, owner.paymentIntentId);

		const operationKey = `qty:${randomUUID()}`;

		const { quote, plan, state } = await this.prisma.$transaction(async (tx) => {
			const state = await this.load(tx, bookingId);
			const { quote, plan } = await this.build(actor, state, data, tx);

			if (actor.kind === 'client' && quote.direction === 'INCREASE') {
				throw new AppException(AppErrorCode.QUANTITY_PAYMENT_REQUIRED);
			}

			if (
				actor.kind === 'client' &&
				quote.refund &&
				data.expectedRefundInCents !== quote.refund.netInCents
			) {
				throw new AppException(AppErrorCode.QUANTITY_QUOTE_CHANGED, {
					refundInCents: quote.refund.netInCents,
				});
			}

			const changed = await tx.booking.updateMany({
				where: {
					id: bookingId,
					status: 'CONFIRMED',
					quantity: quote.currentQuantity,
					checkedInAt: null,
				},
				data: {
					quantity: quote.newQuantity,
					amount: new Prisma.Decimal((quote.newAmountInCents / 100).toFixed(2)),
				},
			});

			if (changed.count === 0) {
				throw new AppException(AppErrorCode.BOOKING_CHANGED_CONCURRENTLY);
			}

			await releaseSeats(tx, state.booking.occurrenceId, quote.currentQuantity - quote.newQuantity);

			if (plan && quote.refund) {
				await this.refunds.queuePlan(tx, bookingId, plan, {
					operationKey,
					reason: this.reasonFor(quote),
					method: quote.refund.method,
				});
			}

			return { quote, plan, state };
		});

		const outcome =
			plan && quote.refund?.method === 'STRIPE'
				? await this.refunds.settlePlan(bookingId, plan, {
						operationKey,
						reason: this.reasonFor(quote),
						failureReason: 'Refund could not be processed at Stripe (guests removed)',
						failureLogSuffix: ' (guests removed)',
					})
				: null;

		await this.notifications.sendQuantityChanged({
			booking: state.booking,
			event: { translations: state.translations },
			occurrence: { date: state.occurrence.date },
			user: state.user,
			oldQuantity: quote.currentQuantity,
			newQuantity: quote.newQuantity,
			newAmount: quote.newAmountInCents / 100,
			byOrganiser: actor.kind === 'admin',
			refund: this.emailRefund(quote, state, outcome),
		});

		return {
			bookingId,
			quantity: quote.newQuantity,
			amount: quote.newAmountInCents / 100,
			quote,
		};
	}

	private async assertAllowed(actor: QuantityActor, bookingId: string) {
		const booking = await this.prisma.booking.findUnique({
			where: { id: bookingId },
			select: { userId: true, paymentIntentId: true },
		});

		if (!booking) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
		if (actor.kind === 'client' && booking.userId !== actor.userId) {
			throw new AppException(AppErrorCode.NOT_YOUR_BOOKING);
		}

		return booking;
	}

	private async load(db: Db, bookingId: string): Promise<QuantityState> {
		const booking = await db.booking.findUnique({
			where: { id: bookingId },
			include: {
				user: true,
				occurrence: {
					include: { event: { include: { cancellationRules: true, translations: true } } },
				},
			},
		});

		if (!booking) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
		if (!booking.occurrence) throw new AppException(AppErrorCode.OCCURRENCE_NOT_FOUND);

		return {
			booking: {
				id: booking.id,
				userId: booking.userId,
				status: booking.status,
				quantity: booking.quantity,
				amount: booking.amount,
				occurrenceId: booking.occurrenceId,
				checkedInAt: booking.checkedInAt,
				referenceNumber: booking.referenceNumber,
				brandHost: booking.brandHost,
				paymentMethod: booking.paymentMethod,
			},
			user: { email: booking.user.email, name: booking.user.name, locale: booking.user.locale },
			translations: (booking.occurrence.event?.translations ?? []).map((row) => ({
				locale: row.locale,
				title: row.title,
			})),
			occurrence: {
				id: booking.occurrence.id,
				date: booking.occurrence.date,
				maxParticipants: booking.occurrence.maxParticipants,
				currentParticipants: booking.occurrence.currentParticipants,
				rules: booking.occurrence.event?.cancellationRules ?? [],
			},
		};
	}

	private async build(
		actor: QuantityActor,
		state: QuantityState,
		request: QuantityQuoteRequest,
		db: Db,
	): Promise<{ quote: QuantityQuote; plan: GuestRefund | null }> {
		const { booking, occurrence } = state;
		const now = new Date();

		if (actor.kind === 'client' && booking.userId !== actor.userId) {
			throw new AppException(AppErrorCode.NOT_YOUR_BOOKING);
		}
		if (booking.status !== 'CONFIRMED') throw new AppException(AppErrorCode.BOOKING_NOT_CONFIRMED);
		if (booking.checkedInAt) throw new AppException(AppErrorCode.ALREADY_CHECKED_IN);
		if (actor.kind === 'client' && occurrence.date.getTime() <= now.getTime()) {
			throw new AppException(AppErrorCode.TOUR_ALREADY_STARTED);
		}
		if (request.quantity === booking.quantity) {
			throw new AppException(AppErrorCode.QUANTITY_UNCHANGED);
		}
		if (actor.kind === 'client' && booking.paymentMethod !== 'SITE_PAYMENT') {
			throw new AppException(AppErrorCode.QUANTITY_SETTLEMENT_INVALID);
		}

		const currentAmountInCents = toCents(booking.amount);
		const unitPriceInCents = Math.round(currentAmountInCents / booking.quantity);
		const newAmountInCents = unitPriceInCents * request.quantity;

		const base = {
			bookingId: booking.id,
			currentQuantity: booking.quantity,
			newQuantity: request.quantity,
			unitPriceInCents,
			currentAmountInCents,
			newAmountInCents,
		};

		if (request.quantity > booking.quantity) {
			if (actor.kind === 'admin') throw new AppException(AppErrorCode.QUANTITY_INCREASE_NOT_ALLOWED);
			if ((request.settlement && request.settlement !== 'CARD') || request.refundMethod) {
				throw new AppException(AppErrorCode.QUANTITY_SETTLEMENT_INVALID);
			}

			const spotsLeft = Math.max(0, occurrence.maxParticipants - occurrence.currentParticipants);
			if (request.quantity - booking.quantity > spotsLeft) {
				throw spotsLeft === 0
					? new AppException(AppErrorCode.NO_SPOTS_AVAILABLE)
					: new AppException(AppErrorCode.NOT_ENOUGH_SPOTS, { spotsLeft });
			}

			return {
				quote: {
					...base,
					direction: 'INCREASE',
					settlement: 'CARD',
					dueInCents: newAmountInCents - currentAmountInCents,
					refund: null,
				},
				plan: null,
			};
		}

		const settlement = request.settlement ?? 'RULES';
		const requestedMethod: RefundMethod = request.refundMethod ?? 'STRIPE';

		if (settlement === 'CARD') throw new AppException(AppErrorCode.QUANTITY_SETTLEMENT_INVALID);
		if (actor.kind === 'client' && (settlement !== 'RULES' || requestedMethod !== 'STRIPE')) {
			throw new AppException(AppErrorCode.QUANTITY_SETTLEMENT_INVALID);
		}

		const percentage =
			settlement === 'FULL' ? 100 : calculateRefundPercentage(now, occurrence.date, occurrence.rules);

		const plan = await this.refunds.planForBooking(db, {
			bookingId: booking.id,
			amount: Number(booking.amount),
			quantity: booking.quantity,
			guests: booking.quantity - request.quantity,
			percentage,
			withholdFee: settlement === 'RULES',
		});

		if (booking.paymentMethod === 'SITE_PAYMENT' && !plan.paidByCard) {
			throw new AppException(AppErrorCode.PAYMENT_SERVICE_UNAVAILABLE);
		}

		return {
			quote: {
				...base,
				direction: 'DECREASE',
				settlement,
				dueInCents: 0,
				refund: {
					method: plan.paidByCard ? requestedMethod : 'MANUAL',
					percentage,
					grossInCents: plan.grossInCents,
					feeInCents: plan.feeInCents,
					netInCents: plan.netInCents,
				},
			},
			plan,
		};
	}

	private emailRefund(
		quote: QuantityQuote,
		state: QuantityState,
		outcome: { refundedInCents: number | null; failed: boolean } | null,
	) {
		if (!quote.refund || state.booking.paymentMethod === 'PAY_ON_ARRIVAL') return undefined;
		if (quote.refund.netInCents === 0) return { kind: 'notRefundable' as const };
		if (quote.refund.method === 'MANUAL') {
			return { kind: 'manual' as const, amount: quote.refund.netInCents / 100 };
		}
		if (outcome?.failed) return { kind: 'pending' as const };
		if (outcome?.refundedInCents) {
			return { kind: 'refunded' as const, amount: outcome.refundedInCents / 100 };
		}

		return { kind: 'pending' as const };
	}

	private reasonFor(quote: QuantityQuote): string {
		return `Booking changed from ${quote.currentQuantity} to ${quote.newQuantity} guests`;
	}
}
