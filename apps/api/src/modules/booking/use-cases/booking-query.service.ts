import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Prisma } from '@prisma/client';
import { EnvKey } from '@event-space/shared';
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
import { bookingLinkSecret, verifyBookingLinkToken } from '../booking-link-token';
import {
	resolveRefundPolicy,
	mapOccurrenceForBookingResponse,
	nullableNumber,
	buildCheckinToken,
} from '../booking.utils';
import { readPayments, toLedgerRows } from '../money/booking-money';
import {
	decodeMyBookingsCursor,
	encodeMyBookingsCursor,
	myBookingsOrder,
	myBookingsPhases,
	myBookingsWhere,
	type MyBookingsPhase,
} from '../my-bookings-filters';

const MY_BOOKING_INCLUDE = {
	adjustments: true,
	review: true,
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
} satisfies Prisma.BookingInclude;

type MyBookingRow = Prisma.BookingGetPayload<{ include: typeof MY_BOOKING_INCLUDE }>;

@Injectable()
export class BookingQueryService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly config: ConfigService,
	) {}

	private tokenConfig() {
		return {
			reviewTokenSecret: this.config.get<string>(EnvKey.REVIEW_TOKEN_SECRET),
			jwtSecret: this.config.getOrThrow<string>(EnvKey.JWT_ACCESS_SECRET),
		};
	}

	async findByUser(
		userId: string,
		params: { cursor?: string; limit?: number; status?: BookingDisplayStatus } = {},
	): Promise<PaginatedCursorResponse<BookingWithEstimate>> {
		const limit = Math.min(Math.max(params.limit ?? MY_BOOKINGS_PAGE_SIZE, 1), 50);

		const cursor = decodeMyBookingsCursor(params.cursor);
		const boundary = cursor?.boundary ?? new Date();
		const phases = myBookingsPhases(params.status);
		const firstPhase = cursor ? phases.indexOf(cursor.phase) : 0;
		const resumed = cursor && firstPhase >= 0 ? cursor : null;

		const rows: { row: MyBookingRow; phase: MyBookingsPhase }[] = [];

		for (const phase of phases.slice(Math.max(firstPhase, 0))) {
			const missing = limit + 1 - rows.length;
			if (missing <= 0) break;

			const page = await this.prisma.booking.findMany({
				where: myBookingsWhere({
					userId,
					status: params.status,
					phase,
					boundary,
					after: resumed?.phase === phase ? resumed : null,
				}),
				include: MY_BOOKING_INCLUDE,
				take: missing,
				orderBy: myBookingsOrder(phase),
			});

			rows.push(...page.map((row) => ({ row, phase })));
		}

		const hasMore = rows.length > limit;
		const bookings = (hasMore ? rows.slice(0, limit) : rows).map((entry) => entry.row);
		const last = hasMore ? rows[limit - 1] : undefined;

		const now = new Date();
		const enrichedBookings = bookings.map((row) => this.enrich(row, now));

		return {
			data: enrichedBookings,
			nextCursor: last
				? encodeMyBookingsCursor({
						phase: last.phase,
						boundary,
						date: last.row.occurrence.date,
						id: last.row.id,
					})
				: null,
			hasMore,
		};
	}

	/**
	 * A booking as the client sees it: the refund they would get today and the check-in code.
	 * The ledger is read for the fee and then dropped, it is the company's accounting.
	 */
	private enrich(row: MyBookingRow, now: Date): BookingWithEstimate {
		// The ledger is read for the fee and then dropped: it is the company's accounting,
		// not something the client's own booking list should carry.
		const { adjustments, ...booking } = row;
		const occurrence = booking.occurrence;
		const event = occurrence?.event;
		if (!event || !booking.paymentIntentId || Number(booking.amount) === 0) {
			return {
				...booking,
				amount: Number(booking.amount),
				baseAmount: nullableNumber(booking.baseAmount),
				occurrence: occurrence ? mapOccurrenceForBookingResponse(occurrence) : undefined,
				refundPercentage: 0,
				refundReason: 'RULES' as const,
				estimatedStripeFeeInCents: 0,
				estimatedRefundInCents: 0,
				checkinToken: buildCheckinToken(booking, occurrence?.date, this.tokenConfig()),
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
			baseAmount: nullableNumber(booking.baseAmount),
			occurrence: mapOccurrenceForBookingResponse(occurrence),
			refundPercentage: policy.percentage,
			refundReason: policy.reason,
			estimatedStripeFeeInCents,
			estimatedRefundInCents,
			checkinToken: buildCheckinToken(booking, occurrence.date, this.tokenConfig()),
		};
	}

	/**
	 * The two things every page of the site asks about the visitor's bookings: how many are
	 * still ahead of them, and which dates they already hold.
	 *
	 * A separate query on purpose. The list above drags in the event, its pictures, its
	 * translations and the ledger to work out a refund estimate, and the header badge has no
	 * use for any of it — before this, every page of the site pulled the lot.
	 */
	async summaryForUser(userId: string): Promise<MyBookingsSummary> {
		const bookings = await this.prisma.booking.findMany({
			where: { userId, status: 'CONFIRMED' },
			select: {
				id: true,
				occurrenceId: true,
				status: true,
				checkedInAt: true,
				occurrence: { select: { date: true, event: { select: { duration: true } } } },
			},
		});

		return {
			activeCount: countActiveBookings(bookings, Date.now()),
			confirmedOccurrenceIds: bookings.map((booking) => booking.occurrenceId),
			confirmedBookings: bookings.map((booking) => ({
				id: booking.id,
				occurrenceId: booking.occurrenceId,
			})),
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

	/**
	 * Who is acting on a booking: the signed-in visitor, or whoever holds the link from the
	 * booking's own email. The link is checked against the booking in the path, so one link opens
	 * one booking and nothing else. Without either there is nobody to act as.
	 */
	async resolveActor(bookingId: string, userId?: string, token?: string): Promise<string> {
		if (token) {
			const booking = await this.prisma.booking.findUnique({
				where: { id: bookingId },
				select: { userId: true },
			});

			const secret = bookingLinkSecret(
				this.config.get<string>(EnvKey.REVIEW_TOKEN_SECRET),
				this.config.getOrThrow<string>(EnvKey.JWT_ACCESS_SECRET),
			);

			if (booking && verifyBookingLinkToken(bookingId, token, secret)) {
				return booking.userId;
			}
		}

		if (!userId) throw new AppException(AppErrorCode.UNAUTHORIZED);

		return userId;
	}

	/** One booking in full, the way the list shows it, for the page behind a link in an email. */
	async findOneDetailed(userId: string, bookingId: string): Promise<BookingWithEstimate> {
		const row = await this.prisma.booking.findUnique({
			where: { id: bookingId },
			include: MY_BOOKING_INCLUDE,
		});

		if (!row) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
		if (row.userId !== userId) throw new AppException(AppErrorCode.NOT_YOUR_BOOKING);

		return this.enrich(row, new Date());
	}

	async findOneForUser(userId: string, bookingId: string) {
		const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });

		if (!booking) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
		if (booking.userId !== userId) throw new AppException(AppErrorCode.NOT_YOUR_BOOKING);

		return booking;
	}
}
