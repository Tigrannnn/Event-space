import { Injectable, Logger } from '@nestjs/common';
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
import { StripeService } from '@infra/stripe/stripe.service';
import { StripeBalanceTransaction } from '@infra/stripe/stripe.types';
import { resolveRefundPolicy, mapOccurrenceForBookingResponse } from '../booking.utils';
import {
	encodeBookingCursor,
	myBookingsWhere,
	MY_BOOKINGS_ORDER,
} from '../my-bookings-filters';

@Injectable()
export class BookingQueryService {
	private readonly logger = new Logger(BookingQueryService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly stripe: StripeService,
	) {}

	async findByUser(
		userId: string,
		params: { cursor?: string; limit?: number; status?: BookingDisplayStatus } = {},
	): Promise<PaginatedCursorResponse<BookingWithEstimate>> {
		const limit = Math.min(Math.max(params.limit ?? MY_BOOKINGS_PAGE_SIZE, 1), 50);

		const rows = await this.prisma.booking.findMany({
			where: myBookingsWhere({ userId, status: params.status, cursor: params.cursor }),
			include: {
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
		const enrichedBookings = await Promise.all(
			bookings.map(async (booking) => {
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

				let stripeFeeInCents = 0;
				try {
					const paymentIntent = await this.stripe.retrievePaymentIntent(booking.paymentIntentId);
					if (paymentIntent.status === 'succeeded' && paymentIntent.latest_charge) {
						const charge = await this.stripe.getCharge(paymentIntent.latest_charge as string);
						const balanceTx = charge.balance_transaction as StripeBalanceTransaction;
						if (balanceTx && typeof balanceTx === 'object' && 'fee' in balanceTx) {
							stripeFeeInCents = balanceTx.fee;
						}
					}
				} catch (error) {
					this.logger.warn(`Failed to get Stripe fee for booking ${booking.id}, using estimate`, error);
				}

				const policy = resolveRefundPolicy({
					now,
					occurrenceDate: new Date(occurrence.date),
					rules: event.cancellationRules,
					rescheduleRefundUntil: booking.rescheduleRefundUntil,
				});
				const baseAmountInCents = Math.round(Number(booking.amount) * 100);
				const calculatedRefundInCents = Math.round((baseAmountInCents * policy.percentage) / 100);

				const estimatedStripeFeeInCents =
					stripeFeeInCents > 0 ? stripeFeeInCents : estimateStripeFeeInCents(Number(booking.amount));

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
			}),
		);

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
