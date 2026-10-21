import { Injectable, Logger } from '@nestjs/common';
import { type BookingStatus, type Locale, type Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import { AppErrorCode } from '@event-space/shared';
import { AppException } from '@shared';
import { calculateRefundPercentage } from '../booking.utils';
import { BookingRefundService, type QueuedCancellation } from '../money/booking-refund.service';
import { BookingNotificationService } from './booking-notification.service';

@Injectable()
export class BookingCancellationService {
	private readonly logger = new Logger(BookingCancellationService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly refunds: BookingRefundService,
		private readonly notifications: BookingNotificationService,
	) {}

	async cancel(userId: string, bookingId: string, locale?: Locale) {
		const owner = await this.prisma.booking.findUnique({
			where: { id: bookingId },
			select: { paymentIntentId: true, status: true, occurrence: { select: { date: true } } },
		});
		const refundable =
			owner && owner.status !== 'CANCELLED' && (owner.occurrence?.date.getTime() ?? 0) > Date.now();
		if (refundable) await this.refunds.prepare(bookingId, owner.paymentIntentId);

		const { booking, occurrence, event, user, alreadyCancelled, queued } =
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
						queued: null as QueuedCancellation | null,
					};
				}

				if (currentBooking.occurrence && currentBooking.occurrence.date.getTime() <= Date.now()) {
					throw new AppException(AppErrorCode.TOUR_ALREADY_STARTED);
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
				const queued = cancelledEvent
					? await this.refunds.queueCancellation(tx, currentBooking, {
							percentage: calculateRefundPercentage(
								new Date(),
								new Date(currentBooking.occurrence?.date ?? new Date()),
								cancelledEvent.cancellationRules,
							),
							withholdFee: true,
							reason: 'Booking cancelled. Stripe fee withheld.',
							method: 'STRIPE',
						})
					: null;

				return {
					booking: updatedBooking,
					occurrence: currentBooking.occurrence,
					event: cancelledEvent,
					user: currentBooking.user,
					alreadyCancelled: false,
					queued,
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

		const outcome = queued
			? await this.refunds.settleCancellation(queued, 'Refund could not be processed at Stripe', '')
			: { refundedInCents: null, failed: false, coveredByFee: null };

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
		await this.cancelMany(
			{ occurrence: { eventId } },
			(tx) => tx.eventOccurrence.updateMany({ where: { eventId }, data: { currentParticipants: 0 } }),
			{
				reason: 'Event cancelled. Full refund.',
				failureReason: 'Refund could not be processed at Stripe (event cancelled)',
				failureLogSuffix: ' (event cancellation)',
			},
		);
	}

	async cancelOccurrenceBookings(occurrenceId: string): Promise<void> {
		await this.cancelMany(
			{ occurrenceId },
			(tx) =>
				tx.eventOccurrence.update({ where: { id: occurrenceId }, data: { currentParticipants: 0 } }),
			{
				reason: 'Occurrence cancelled. Full refund.',
				failureReason: 'Refund could not be processed at Stripe (occurrence cancelled)',
				failureLogSuffix: ' (occurrence cancellation)',
			},
		);
	}

	private async cancelMany(
		where: Prisma.BookingWhereInput,
		resetSeats: (tx: Prisma.TransactionClient) => Promise<unknown>,
		texts: { reason: string; failureReason: string; failureLogSuffix: string },
	): Promise<void> {
		const open = { ...where, status: { in: ['PENDING', 'CONFIRMED'] as BookingStatus[] } };

		const toPrepare = await this.prisma.booking.findMany({
			where: open,
			select: { id: true, paymentIntentId: true },
		});
		for (const booking of toPrepare) {
			await this.refunds.prepare(booking.id, booking.paymentIntentId);
		}

		const queued = await this.prisma.$transaction(async (tx) => {
			const bookings = await tx.booking.findMany({ where: open });

			await tx.booking.updateMany({ where: open, data: { status: 'CANCELLED' } });
			await resetSeats(tx);

			const queued: QueuedCancellation[] = [];
			for (const booking of bookings) {
				const refund = await this.refunds.queueCancellation(tx, booking, {
					percentage: 100,
					withholdFee: false,
					reason: texts.reason,
					method: 'STRIPE',
				});
				if (refund) queued.push(refund);
			}

			return queued;
		});

		for (const refund of queued) {
			await this.refunds.settleCancellation(refund, texts.failureReason, texts.failureLogSuffix);
		}
	}
}
