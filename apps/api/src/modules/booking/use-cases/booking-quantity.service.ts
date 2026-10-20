import { randomUUID } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma, type Locale } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import {
	AppErrorCode,
	type ChangeQuantityData,
	type QuantityQuote,
	type QuantityQuoteRequest,
	type QuantitySettlement,
} from '@event-space/shared';
import { AppException } from '@shared';
import { calculateRefundPercentage } from '../booking.utils';
import { releaseSeats, reserveSeats } from '../occurrence-seats';
import { BookingLedgerService } from '../money/booking-ledger.service';
import { BookingRefundService } from '../money/booking-refund.service';
import { BookingNotificationService } from './booking-notification.service';
import {
	summarizeBookingMoney,
	toMoneyAdjustments,
	type MoneyAdjustment,
} from '../money/booking-money';
import { allocatePartialRefund, type RefundAllocation } from '../money/refund-allocation';

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
	adjustments: MoneyAdjustment[];
}

interface BuiltQuote {
	quote: QuantityQuote;
	allocation: RefundAllocation | null;
}

const DECREASE_SETTLEMENTS: QuantitySettlement[] = ['RULES', 'FULL', 'NONE'];
const INCREASE_SETTLEMENTS: QuantitySettlement[] = ['OFFLINE_PAID', 'PAY_ON_ARRIVAL'];

const toCents = (value: Prisma.Decimal | number): number => Math.round(Number(value) * 100);

@Injectable()
export class BookingQuantityService {
	private readonly logger = new Logger(BookingQuantityService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly ledger: BookingLedgerService,
		private readonly refunds: BookingRefundService,
		private readonly notifications: BookingNotificationService,
	) {}

	async quote(
		actor: QuantityActor,
		bookingId: string,
		request: QuantityQuoteRequest,
	): Promise<QuantityQuote> {
		const state = await this.load(this.prisma, bookingId);
		return this.build(actor, state, request, new Date()).quote;
	}

	async change(actor: QuantityActor, bookingId: string, data: ChangeQuantityData) {
		await this.assertAllowed(actor, bookingId);
		await this.refunds.fillMissingFees(bookingId);

		const operationKey = `qty:${randomUUID()}`;

		const { quote, allocation, state } = await this.prisma.$transaction(async (tx) => {
			const state = await this.load(tx, bookingId);
			const built = this.build(actor, state, data, new Date());
			const { quote: current } = built;

			if (actor.kind === 'client' && current.direction === 'INCREASE') {
				throw new AppException(AppErrorCode.QUANTITY_PAYMENT_REQUIRED);
			}

			if (
				actor.kind === 'client' &&
				current.refund &&
				data.expectedRefundInCents !== current.refund.netInCents
			) {
				throw new AppException(AppErrorCode.QUANTITY_QUOTE_CHANGED, {
					refundInCents: current.refund.netInCents,
				});
			}

			const changed = await tx.booking.updateMany({
				where: {
					id: bookingId,
					status: 'CONFIRMED',
					quantity: current.currentQuantity,
					checkedInAt: null,
				},
				data: {
					quantity: current.newQuantity,
					amount: new Prisma.Decimal((current.newAmountInCents / 100).toFixed(2)),
				},
			});

			if (changed.count === 0) {
				throw new AppException(AppErrorCode.BOOKING_CHANGED_CONCURRENTLY);
			}

			if (current.direction === 'DECREASE') {
				await releaseSeats(
					tx,
					state.booking.occurrenceId,
					current.currentQuantity - current.newQuantity,
				);
				if (built.allocation) {
					await this.refunds.queueAllocation(tx, bookingId, built.allocation, {
						operationKey,
						reason: this.reasonFor(current),
						cashStatus: actor.kind === 'admin' ? 'SUCCEEDED' : 'PENDING',
					});
				}
			} else {
				await reserveSeats(tx, state.occurrence, current.newQuantity - current.currentQuantity);

				if (current.settlement === 'OFFLINE_PAID') {
					await this.ledger.recordOfflineCharge(tx, {
						bookingId,
						amount: current.dueInCents / 100,
						reason: `Paid offline for ${current.newQuantity - current.currentQuantity} more guests, entered by an admin`,
					});
				}
			}

			return { ...built, state };
		});

		let refundOutcome: { refundedInCents: number | null; failed: boolean } | null = null;

		if (quote.direction === 'DECREASE' && allocation) {
			refundOutcome = await this.refunds.settleAllocation(bookingId, allocation, {
				operationKey,
				reason: this.reasonFor(quote),
				failureReason: 'Refund could not be processed at Stripe (guests removed)',
				failureLogSuffix: ' (guests removed)',
			});
		}

		await this.notifications.sendQuantityChanged({
			booking: state.booking,
			event: { translations: state.translations },
			occurrence: { date: state.occurrence.date },
			user: state.user,
			oldQuantity: quote.currentQuantity,
			newQuantity: quote.newQuantity,
			newAmount: quote.newAmountInCents / 100,
			byOrganiser: actor.kind === 'admin',
			...this.emailMoney(quote, allocation, refundOutcome),
		});

		return {
			bookingId,
			quantity: quote.newQuantity,
			amount: quote.newAmountInCents / 100,
			quote,
		};
	}

	private async assertAllowed(actor: QuantityActor, bookingId: string): Promise<void> {
		const booking = await this.prisma.booking.findUnique({
			where: { id: bookingId },
			select: { userId: true },
		});

		if (!booking) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
		if (actor.kind === 'client' && booking.userId !== actor.userId) {
			throw new AppException(AppErrorCode.NOT_YOUR_BOOKING);
		}
	}

	private async load(
		db: Pick<Prisma.TransactionClient, 'booking' | 'bookingAdjustment'>,
		bookingId: string,
	): Promise<QuantityState> {
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

		const rows = await this.ledger.listForBooking(db, bookingId);

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
			adjustments: toMoneyAdjustments(rows),
		};
	}

	private build(
		actor: QuantityActor,
		state: QuantityState,
		request: QuantityQuoteRequest,
		now: Date,
	): BuiltQuote {
		const { booking, occurrence } = state;

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

		const direction = request.quantity < booking.quantity ? 'DECREASE' : 'INCREASE';

		const settlement = this.settlementFor(actor, direction, request.settlement);

		const currentAmountInCents = toCents(booking.amount);
		const unitPriceInCents = Math.round(currentAmountInCents / booking.quantity);
		const newAmountInCents = unitPriceInCents * request.quantity;

		const base = {
			bookingId: booking.id,
			currentQuantity: booking.quantity,
			newQuantity: request.quantity,
			direction,
			settlement,
			unitPriceInCents,
			currentAmountInCents,
			newAmountInCents,
		} as const;

		if (direction === 'INCREASE') {
			if (
				request.quantity - booking.quantity >
				occurrence.maxParticipants - occurrence.currentParticipants
			) {
				const spotsLeft = Math.max(0, occurrence.maxParticipants - occurrence.currentParticipants);
				throw spotsLeft === 0
					? new AppException(AppErrorCode.NO_SPOTS_AVAILABLE)
					: new AppException(AppErrorCode.NOT_ENOUGH_SPOTS, { spotsLeft });
			}

			return {
				quote: {
					...base,
					dueInCents: newAmountInCents - currentAmountInCents,
					refund: null,
				},
				allocation: null,
			};
		}

		if (settlement === 'NONE') {
			return { quote: { ...base, dueInCents: 0, refund: null }, allocation: null };
		}

		const percentage =
			settlement === 'FULL' ? 100 : calculateRefundPercentage(now, occurrence.date, occurrence.rules);

		const money = summarizeBookingMoney(state.adjustments, Number(booking.amount));
		const allocation = allocatePartialRefund({
			payments: money.payments,
			removedUnits: booking.quantity - request.quantity,
			unitPriceInCents,
			percentage,
		});

		return {
			quote: {
				...base,
				dueInCents: 0,
				refund: {
					percentage,
					grossInCents: allocation.grossInCents,
					netInCents: allocation.netInCents,
					feeWithheldInCents: allocation.feeWithheldInCents,
					parts: allocation.parts.map((part) => ({
						method: part.method,
						grossInCents: part.grossInCents,
						netInCents: part.netInCents,
					})),
				},
			},
			allocation,
		};
	}

	private settlementFor(
		actor: QuantityActor,
		direction: 'DECREASE' | 'INCREASE',
		requested: QuantitySettlement | undefined,
	): QuantitySettlement {
		if (actor.kind === 'client') {
			const own: QuantitySettlement = direction === 'DECREASE' ? 'RULES' : 'CARD';
			if (requested && requested !== own) {
				throw new AppException(AppErrorCode.QUANTITY_SETTLEMENT_INVALID);
			}
			return own;
		}

		const allowed = direction === 'DECREASE' ? DECREASE_SETTLEMENTS : INCREASE_SETTLEMENTS;
		const settlement = requested ?? allowed[direction === 'DECREASE' ? 0 : 1];

		if (!allowed.includes(settlement)) {
			throw new AppException(AppErrorCode.QUANTITY_SETTLEMENT_INVALID);
		}

		return settlement;
	}

	private emailMoney(
		quote: QuantityQuote,
		allocation: RefundAllocation | null,
		outcome: { refundedInCents: number | null; failed: boolean } | null,
	) {
		if (quote.direction === 'INCREASE') {
			return {
				extra: {
					kind:
						quote.settlement === 'OFFLINE_PAID' ? ('paidOffline' as const) : ('payOnArrival' as const),
					amount: quote.dueInCents / 100,
				},
			};
		}

		const cashInCents = (allocation?.parts ?? [])
			.filter((part) => part.method === 'OFFLINE')
			.reduce((sum, part) => sum + part.netInCents, 0);
		const cashRefundAmount = cashInCents > 0 ? cashInCents / 100 : undefined;

		if (outcome?.failed) return { refund: { kind: 'pending' as const }, cashRefundAmount };
		if (outcome?.refundedInCents) {
			return {
				refund: { kind: 'refunded' as const, amount: outcome.refundedInCents / 100 },
				cashRefundAmount,
			};
		}
		if (cashRefundAmount) return { cashRefundAmount };

		return { refund: { kind: 'notRefundable' as const } };
	}

	private reasonFor(quote: QuantityQuote): string {
		return `Booking changed from ${quote.currentQuantity} to ${quote.newQuantity} guests`;
	}
}
