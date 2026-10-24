import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import {
	AppErrorCode,
	BookingWithEstimate,
	countActiveBookings,
	estimateStripeFeeInCents,
	MY_BOOKINGS_PAGE_SIZE,
	type BookingDisplayStatus,
	type MyBookingsSummary,
	type PaginatedCursorResponse,
} from '@event-space/shared';
import { AppException } from '@shared';
import { resolveRefundPolicy, mapOccurrenceForBookingResponse } from '../booking.utils';
import { readPayments, toLedgerRows } from '../money/booking-money';
import { encodeBookingCursor, myBookingsWhere, MY_BOOKINGS_ORDER } from '../my-bookings-filters';

@Injectable()
export class BookingQueryService {
	constructor(private readonly prisma: PrismaService) {}

	async findByUser(
		userId: string,
		params: { cursor?: string; limit?: number; status?: BookingDisplayStatus } = {},
	): Promise<PaginatedCursorResponse<BookingWithEstimate>> {
		const limit = Math.min(Math.max(params.limit ?? MY_BOOKINGS_PAGE_SIZE, 1), 50);

		const rows = await this.prisma.booking.findMany({
			where: myBookingsWhere({ userId, status: params.status, cursor: params.cursor }),
			include: {
				adjustments: true,
				occurrence: {
					include: {
						event: {
							include: {
								images: true,
								cancellationRules: true,
								translations: true,
								category: { include: { translations: true } },
								occurrences: true,
							},
						},
					},
				},
				user: {
					select: {
						id: true,
						email: true,
						name: true,
						phone: true,
						image: true,
						role: true,
						emailVerified: true,
						isShadow: true,
						locale: true,
						createdAt: true,
						updatedAt: true,
					},
				},
			},
			take: limit + 1,
			orderBy: MY_BOOKINGS_ORDER,
		});

		const hasMore = rows.length > limit;
		const bookings = hasMore ? rows.slice(0, limit) : rows;
		const last = bookings[bookings.length - 1];

		const now = new Date();
		const enrichedBookings = bookings.map((row) => {
			// The ledger is read for the fee and then dropped: it is the company's accounting,
			// not something the client's own booking list should carry.
			const { adjustments, ...booking } = row;
			const occurrence = booking.occurrence;
			const event = occurrence?.event;
			if (!event || !booking.paymentIntentId || Number(booking.amount) === 0) {
				return {
					...booking,
					amount: Number(booking.amount),
					occurrence: occurrence ? mapOccurrenceForBookingResponse(occurrence) : undefined,
					refundPercentage: 0,
					refundReason: 'RULES' as const,
					estimatedStripeFeeInCents: 0,
					estimatedRefundInCents: 0,
				};
			}

			// The fee Stripe actually charged is already in our own ledger: `recordChargeFee`
			// writes it onto the CHARGE row the moment the payment settles. Asking Stripe
			// again here cost two API calls per booking on every read of this list.
			const payments = readPayments(toLedgerRows(adjustments ?? []));
			const feeFromLedgerInCents = payments.cards.reduce((total, card) => total + card.feeInCents, 0);

			const policy = resolveRefundPolicy({
				now,
				occurrenceDate: new Date(occurrence.date),
				rules: event.cancellationRules,
				rescheduleRefundUntil: booking.rescheduleRefundUntil,
			});
			const baseAmountInCents = Math.round(Number(booking.amount) * 100);
			const calculatedRefundInCents = Math.round((baseAmountInCents * policy.percentage) / 100);

			// Every card charge counts, top-ups included: the amount being refunded is the
			// whole booking, so the fee withheld has to cover the whole booking too.
			const estimatedStripeFeeInCents =
				feeFromLedgerInCents > 0
					? feeFromLedgerInCents
					: estimateStripeFeeInCents(Number(booking.amount));

			const withheldInCents = policy.withholdStripeFee ? estimatedStripeFeeInCents : 0;
			const estimatedRefundInCents = Math.max(0, calculatedRefundInCents - withheldInCents);

			return {
				...booking,
				amount: Number(booking.amount),
				occurrence: mapOccurrenceForBookingResponse(occurrence),
				refundPercentage: policy.percentage,
				refundReason: policy.reason,
				estimatedStripeFeeInCents,
				estimatedRefundInCents,
			};
		});

		return {
			data: enrichedBookings,
			nextCursor: hasMore && last ? encodeBookingCursor(last) : null,
			hasMore,
		};
	}

	/**
	 * The two things every page of the site asks about the visitor's bookings: how many are
	 * still ahead of them, and which dates they already hold.
	 *
	 * A separate query on purpose. The list above costs two Stripe calls per booking to work
	 * out what a refund would be, and the header badge has no use for that — before this, every
	 * page load paid for it.
	 */
	async summaryForUser(userId: string): Promise<MyBookingsSummary> {
		const bookings = await this.prisma.booking.findMany({
			where: { userId, status: 'CONFIRMED' },
			select: {
				occurrenceId: true,
				status: true,
				checkedInAt: true,
				occurrence: { select: { date: true, event: { select: { duration: true } } } },
			},
		});

		return {
			activeCount: countActiveBookings(bookings, Date.now()),
			confirmedOccurrenceIds: bookings.map((booking) => booking.occurrenceId),
		};
	}

	async acceptReschedule(userId: string, bookingId: string) {
		const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });

		if (!booking) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
		if (booking.userId !== userId) throw new AppException(AppErrorCode.NOT_YOUR_BOOKING);

		await this.prisma.booking.updateMany({
			where: { id: bookingId, userId },
			data: { rescheduleAcceptedAt: new Date(), rescheduleRefundUntil: null },
		});

		return { accepted: true };
	}

	async findOneForUser(userId: string, bookingId: string) {
		const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });

		if (!booking) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
		if (booking.userId !== userId) throw new AppException(AppErrorCode.NOT_YOUR_BOOKING);

		return booking;
	}
}
