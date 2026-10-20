import { Injectable, Logger } from '@nestjs/common';
import { type Locale, type Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import { AppErrorCode } from '@event-space/shared';
import { AppException } from '@shared';
import { calculateRefundPercentage } from '../booking.utils';
import { BookingLedgerService } from '../money/booking-ledger.service';
import { BookingRefundService } from '../money/booking-refund.service';
import type { RefundAllocation } from '../money/refund-allocation';
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
		await this.refunds.fillMissingFees(bookingId);

		const { booking, occurrence, event, user, alreadyCancelled, refundGrossInCents, allocation } =
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
						allocation: null as RefundAllocation | null,
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
				let grossInCents = 0;
				let allocation: RefundAllocation | null = null;

				if (currentBooking.paymentIntentId && Number(currentBooking.amount) > 0 && cancelledEvent) {
					const refundPercentage = calculateRefundPercentage(
						new Date(),
						new Date(currentBooking.occurrence?.date ?? new Date()),
						cancelledEvent.cancellationRules,
					);
					const baseAmountInCents = Math.round(Number(currentBooking.amount) * 100);
					grossInCents = Math.round((baseAmountInCents * refundPercentage) / 100);

					allocation = await this.refunds.planCancellation(tx, {
						bookingId: currentBooking.id,
						amount: Number(currentBooking.amount),
						quantity: currentBooking.quantity,
						percentage: refundPercentage,
						withholdFee: true,
					});

					if (allocation) {
						await this.refunds.queueAllocation(tx, currentBooking.id, allocation, {
							operationKey: `cancel:${currentBooking.id}`,
							reason: 'Booking cancelled. Stripe fee withheld.',
							cashStatus: 'PENDING',
						});
					} else if (grossInCents > 0) {
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
					allocation,
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

		const outcome = allocation
			? {
					...(await this.refunds.settleAllocation(booking.id, allocation, {
						operationKey: `cancel:${booking.id}`,
						reason: 'Booking cancelled. Stripe fee withheld.',
						failureReason: 'Refund could not be processed at Stripe',
						failureLogSuffix: '',
					})),
					coveredByFee: null,
				}
			: await this.refunds.settle(
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
		const { bookings, allocations } = await this.prisma.$transaction(async (tx) => {
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

			const allocations = await this.queueCancellationRefunds(
				tx,
				bookings,
				'Event cancelled. Full refund.',
			);

			return { bookings, allocations };
		});

		// Process refunds for each booking
		for (const booking of bookings) {
			if (!booking.paymentIntentId || Number(booking.amount) === 0) {
				continue;
			}

			const allocation = allocations.get(booking.id);
			if (allocation) {
				await this.refunds.settleAllocation(booking.id, allocation, {
					operationKey: `cancel:${booking.id}`,
					reason: 'Event cancelled. Full refund.',
					failureReason: 'Refund could not be processed at Stripe (event cancelled)',
					failureLogSuffix: ' (event cancellation)',
				});
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
		const { bookings, allocations } = await this.prisma.$transaction(async (tx) => {
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

			const allocations = await this.queueCancellationRefunds(
				tx,
				bookings,
				'Occurrence cancelled. Full refund.',
			);

			return { bookings, allocations };
		});

		for (const booking of bookings) {
			if (!booking.paymentIntentId || Number(booking.amount) === 0) {
				continue;
			}

			const allocation = allocations.get(booking.id);
			if (allocation) {
				await this.refunds.settleAllocation(booking.id, allocation, {
					operationKey: `cancel:${booking.id}`,
					reason: 'Occurrence cancelled. Full refund.',
					failureReason: 'Refund could not be processed at Stripe (occurrence cancelled)',
					failureLogSuffix: ' (occurrence cancellation)',
				});
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

	private async queueCancellationRefunds(
		tx: Prisma.TransactionClient,
		bookings: {
			id: string;
			amount: unknown;
			quantity: number;
			paymentIntentId: string | null;
		}[],
		reason: string,
	): Promise<Map<string, RefundAllocation>> {
		const allocations = new Map<string, RefundAllocation>();
		const rows: Parameters<BookingLedgerService['queueRefunds']>[1] = [];

		for (const booking of bookings) {
			if (!booking.paymentIntentId || Number(booking.amount) <= 0) continue;

			const allocation = await this.refunds.planCancellation(tx, {
				bookingId: booking.id,
				amount: Number(booking.amount),
				quantity: booking.quantity,
				percentage: 100,
				withholdFee: false,
			});

			if (allocation) {
				allocations.set(booking.id, allocation);
				await this.refunds.queueAllocation(tx, booking.id, allocation, {
					operationKey: `cancel:${booking.id}`,
					reason,
					cashStatus: 'PENDING',
				});
				continue;
			}

			rows.push({
				bookingId: booking.id,
				paymentIntentId: booking.paymentIntentId,
				amount: Number(booking.amount),
				kind: 'full' as const,
				reason,
			});
		}

		await this.ledger.queueRefunds(tx, rows);

		return allocations;
	}
}
