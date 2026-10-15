import { Injectable, Logger } from '@nestjs/common';
import { type Locale, type Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import { AppErrorCode } from '@event-space/shared';
import { AppException } from '@shared';
import { calculateRefundPercentage } from '../booking.utils';
import { BookingLedgerService } from '../money/booking-ledger.service';
import { BookingRefundService } from '../money/booking-refund.service';
import { BookingNotificationService } from './booking-notification.service';

@Injectable()
export class BookingCancellationService {
	private readonly logger = new Logger(BookingCancellationService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly ledger: BookingLedgerService,
		private readonly refunds: BookingRefundService,
		private readonly notifications: BookingNotificationService,
	) {}

	async cancel(userId: string, bookingId: string, locale?: Locale) {
		const { booking, occurrence, event, user, alreadyCancelled, refundGrossInCents } =
			await this.prisma.$transaction(async (tx) => {
				const currentBooking = await tx.booking.findUnique({
					where: { id: bookingId },
					include: {
						user: true,
						occurrence: {
							include: {
								event: {
									include: {
										cancellationRules: true,
										translations: true,
										category: { include: { translations: true } },
										occurrences: true,
									},
								},
							},
						},
					},
				});

				if (!currentBooking) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
				if (currentBooking.userId !== userId) throw new AppException(AppErrorCode.NOT_YOUR_BOOKING);
				// The tour has been attended; only an admin can still cancel it.
				if (currentBooking.checkedInAt) throw new AppException(AppErrorCode.ALREADY_CHECKED_IN);

				if (locale) {
					await tx.user.update({ where: { id: userId }, data: { locale } });
				}

				if (currentBooking.status === 'CANCELLED') {
					return {
						booking: currentBooking,
						occurrence: currentBooking.occurrence,
						event: currentBooking.occurrence?.event,
						user: currentBooking.user,
						alreadyCancelled: true,
						refundGrossInCents: 0,
					};
				}

				if (currentBooking.status === 'CONFIRMED') {
					await tx.eventOccurrence.updateMany({
						where: {
							id: currentBooking.occurrenceId,
							currentParticipants: { gte: currentBooking.quantity },
						},
						data: { currentParticipants: { decrement: currentBooking.quantity } },
					});
				}

				const updatedBooking = await tx.booking.update({
					where: { id: bookingId },
					data: { status: 'CANCELLED' },
				});

				const cancelledEvent = currentBooking.occurrence?.event;
				let grossInCents = 0;

				if (currentBooking.paymentIntentId && Number(currentBooking.amount) > 0 && cancelledEvent) {
					const refundPercentage = calculateRefundPercentage(
						new Date(),
						new Date(currentBooking.occurrence?.date ?? new Date()),
						cancelledEvent.cancellationRules,
					);
					const baseAmountInCents = Math.round(Number(currentBooking.amount) * 100);
					grossInCents = Math.round((baseAmountInCents * refundPercentage) / 100);

					if (grossInCents > 0) {
						await this.ledger.queueRefunds(tx, [
							{
								bookingId: currentBooking.id,
								paymentIntentId: currentBooking.paymentIntentId,
								amount: grossInCents / 100,
								kind: 'withhold-fee',
								reason: 'Booking cancelled. Stripe fee withheld.',
							},
						]);
					}
				}

				return {
					booking: updatedBooking,
					occurrence: currentBooking.occurrence,
					event: cancelledEvent,
					user: currentBooking.user,
					alreadyCancelled: false,
					refundGrossInCents: grossInCents,
				};
			});

		if (alreadyCancelled) {
			return booking;
		}

		if (!booking.paymentIntentId || Number(booking.amount) === 0) {
			await this.notifications.sendCancellation({
				booking,
				event,
				occurrence,
				user,
				locale,
				offlinePaid: booking.paymentMethod === 'OFFLINE_PAID',
				nothingPaid: booking.paymentMethod !== 'OFFLINE_PAID',
			});

			return booking;
		}

		if (!event) {
			this.logger.warn(`Event not found for booking ${bookingId} during cancel — skipping refund`);
			return booking;
		}

		const outcome = await this.refunds.settle(
			{ id: booking.id, paymentIntentId: booking.paymentIntentId },
			this.refunds.refundPlan({
				paymentIntentId: booking.paymentIntentId,
				grossInCents: refundGrossInCents,
				withholdFee: true,
				idempotencyKey: `cancel-${booking.paymentIntentId}`,
				successReason: 'Booking cancelled. Stripe fee withheld.',
				failureReason: 'Refund could not be processed at Stripe',
				failureLogSuffix: '',
			}),
		);

		await this.notifications.sendCancellation({
			booking,
			event,
			occurrence,
			user,
			locale,
			refundAmount: outcome.refundedInCents !== null ? outcome.refundedInCents / 100 : undefined,
			refundFailed: outcome.failed,
			refundCoveredByFee: outcome.coveredByFee
				? {
						entitled: outcome.coveredByFee.grossInCents / 100,
						fee: outcome.coveredByFee.feeInCents / 100,
					}
				: undefined,
		});

		return booking;
	}

	async cancelEventBookings(eventId: string): Promise<void> {
		const { bookings } = await this.prisma.$transaction(async (tx) => {
			// Get all confirmed and pending bookings for the event through occurrences
			const bookings = await tx.booking.findMany({
				where: {
					occurrence: { eventId },
					status: { in: ['PENDING', 'CONFIRMED'] },
				},
				include: { user: true },
			});

			// Update all bookings to CANCELLED
			await tx.booking.updateMany({
				where: {
					occurrence: { eventId },
					status: { in: ['PENDING', 'CONFIRMED'] },
				},
				data: { status: 'CANCELLED' },
			});

			await tx.eventOccurrence.updateMany({
				where: { eventId },
				data: { currentParticipants: 0 },
			});

			await this.queueFullRefunds(tx, bookings, 'Event cancelled. Full refund.');

			return { bookings };
		});

		// Process refunds for each booking
		for (const booking of bookings) {
			if (!booking.paymentIntentId || Number(booking.amount) === 0) {
				continue;
			}

			await this.refunds.settle(
				{ id: booking.id, paymentIntentId: booking.paymentIntentId },
				this.refunds.refundPlan({
					paymentIntentId: booking.paymentIntentId,
					grossInCents: Math.round(Number(booking.amount) * 100),
					withholdFee: false,
					idempotencyKey: `full-refund-${booking.id}`,
					successReason: 'Event cancelled. Full refund.',
					failureReason: 'Refund could not be processed at Stripe (event cancelled)',
					failureLogSuffix: ' (event cancellation)',
				}),
			);
		}
	}

	async cancelOccurrenceBookings(occurrenceId: string): Promise<void> {
		const { bookings } = await this.prisma.$transaction(async (tx) => {
			const bookings = await tx.booking.findMany({
				where: {
					occurrenceId,
					status: { in: ['PENDING', 'CONFIRMED'] },
				},
				include: { user: true },
			});

			await tx.booking.updateMany({
				where: {
					occurrenceId,
					status: { in: ['PENDING', 'CONFIRMED'] },
				},
				data: { status: 'CANCELLED' },
			});

			await tx.eventOccurrence.update({
				where: { id: occurrenceId },
				data: { currentParticipants: 0 },
			});

			await this.queueFullRefunds(tx, bookings, 'Occurrence cancelled. Full refund.');

			return { bookings };
		});

		for (const booking of bookings) {
			if (!booking.paymentIntentId || Number(booking.amount) === 0) {
				continue;
			}

			await this.refunds.settle(
				{ id: booking.id, paymentIntentId: booking.paymentIntentId },
				this.refunds.refundPlan({
					paymentIntentId: booking.paymentIntentId,
					grossInCents: Math.round(Number(booking.amount) * 100),
					withholdFee: false,
					idempotencyKey: `full-refund-${booking.id}`,
					successReason: 'Occurrence cancelled. Full refund.',
					failureReason: 'Refund could not be processed at Stripe (occurrence cancelled)',
					failureLogSuffix: ' (occurrence cancellation)',
				}),
			);
		}
	}

	private queueFullRefunds(
		tx: Prisma.TransactionClient,
		bookings: { id: string; amount: unknown; paymentIntentId: string | null }[],
		reason: string,
	) {
		return this.ledger.queueRefunds(
			tx,
			bookings.flatMap((booking) =>
				booking.paymentIntentId && Number(booking.amount) > 0
					? [
							{
								bookingId: booking.id,
								paymentIntentId: booking.paymentIntentId,
								amount: Number(booking.amount),
								kind: 'full' as const,
								reason,
							},
						]
					: [],
			),
		);
	}
}
