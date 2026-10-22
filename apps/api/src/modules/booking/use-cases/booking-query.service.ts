import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { AppErrorCode, BookingWithEstimate, estimateStripeFeeInCents } from '@event-space/shared';
import { AppException } from '@shared';
import { StripeService } from '@infra/stripe/stripe.service';
import { StripeBalanceTransaction } from '@infra/stripe/stripe.types';
import { resolveRefundPolicy, mapOccurrenceForBookingResponse } from '../booking.utils';

@Injectable()
export class BookingQueryService {
	private readonly logger = new Logger(BookingQueryService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly stripe: StripeService,
	) {}

	async findByUser(userId: string): Promise<BookingWithEstimate[]> {
		const bookings = await this.prisma.booking.findMany({
			where: { userId },
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
						createdAt: true,
						updatedAt: true,
					},
				},
			},
			orderBy: { updatedAt: 'desc' },
		});

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

		return enrichedBookings;
	}

	/**
	 * The client says the moved date suits them, so the extra right to a full refund goes away.
	 * Letting it simply expire would leave the notice nagging for days after they already decided.
	 */
	async acceptReschedule(userId: string, bookingId: string) {
		const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });

		if (!booking) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
		if (booking.userId !== userId) throw new AppException(AppErrorCode.NOT_YOUR_BOOKING);

		await this.prisma.booking.updateMany({
			where: { id: bookingId, userId },
			data: { rescheduleRefundUntil: null },
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
