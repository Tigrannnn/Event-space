import {
	Injectable,
	NotFoundException,
	ConflictException,
	ForbiddenException,
	ServiceUnavailableException,
	Logger,
} from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CancellationPolicyRule, BookingWithEstimate, isEventAvailable } from '@event-space/shared';
import { CreateBookingData, UpdateBookingData } from '@event-space/shared';
import { StripeService } from '@infra/stripe/stripe.service';
import {
	CANCELABLE_PAYMENT_INTENT_STATUSES,
	CancelablePaymentIntentStatus,
	StripeBalanceTransaction,
} from '@infra/stripe/stripe.types';

@Injectable()
export class BookingService {
	private readonly logger = new Logger(BookingService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly stripe: StripeService,
	) {}

	async create(userId: string, data: CreateBookingData) {
		const { eventId, quantity = 1 } = data;

		const { booking } = await this.prisma.$transaction(async (tx) => {
			const event = await tx.event.findUnique({ where: { id: eventId } });
			if (!event) throw new NotFoundException('Event not found');
			if (!isEventAvailable(event)) {
				throw new ForbiddenException('Event is not available for booking');
			}

			const existing = await tx.booking.findUnique({
				where: { userId_eventId: { userId, eventId } },
			});
			if (existing && existing.status !== 'CANCELLED') {
				throw new ConflictException('Already booked');
			}

			const reserved = await tx.event.updateMany({
				where: {
					id: eventId,
					status: 'PUBLISHED',
					currentParticipants: { lte: event.maxParticipants - quantity },
				},
				data: { currentParticipants: { increment: quantity } },
			});

			if (reserved.count === 0) {
				const spotsLeft = Math.max(0, event.maxParticipants - event.currentParticipants);
				throw new ConflictException(
					spotsLeft === 0 ? 'No spots available' : `Only ${spotsLeft} spots available`,
				);
			}

			const amount = Number(event.price) * quantity;
			const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

			const upserted = await tx.booking.upsert({
				where: { userId_eventId: { userId, eventId } },
				update: { status: 'PENDING', quantity, paymentIntentId: null, amount, expiresAt },
				create: { userId, eventId, status: 'PENDING', quantity, amount, expiresAt },
			});
			return { booking: upserted };
		});

		let paymentIntent: any;
		try {
			paymentIntent = await this.stripe.createPaymentIntent(Number(booking.amount), 'usd', {
				userId,
				eventId,
				bookingId: booking.id,
			});

			const updatedBooking = await this.prisma.booking.update({
				where: { id: booking.id },
				data: { paymentIntentId: paymentIntent.id },
			});

			return { booking: updatedBooking, clientSecret: paymentIntent.client_secret };
		} catch (error) {
			if (paymentIntent && paymentIntent.id) {
				try {
					await this.stripe.cancelPaymentIntent(paymentIntent.id);
				} catch (e) {
					this.logger.error('Failed to cancel payment intent after booking creation error', e as Error);
				}
			}

			await this.releasePendingBooking(booking.id, eventId, quantity);
			this.rethrowStripeError(error);
		}
	}

	// async update(userId: string, bookingId: string, data: UpdateBookingData) {
	// 	const { quantity } = data;

	// 	return this.prisma.$transaction(async (tx) => {
	// 		const booking = await tx.booking.findUnique({ where: { id: bookingId } });
	// 		if (!booking) throw new NotFoundException('Booking not found');
	// 		if (booking.userId !== userId) throw new ForbiddenException('Not your booking');
	// 		if (booking.status === 'CANCELLED') {
	// 			throw new ConflictException('Cannot update cancelled booking');
	// 		}

	// 		const diff = quantity - booking.quantity;
	// 		if (diff === 0) return booking;

	// 		if (diff > 0) {
	// 			const event = await tx.event.findUnique({ where: { id: booking.eventId } });
	// 			if (!event) throw new NotFoundException('Event not found');

	// 			const reserved = await tx.event.updateMany({
	// 				where: {
	// 					id: booking.eventId,
	// 					status: 'PUBLISHED',
	// 					currentParticipants: { lte: event.maxParticipants - diff },
	// 				},
	// 				data: { currentParticipants: { increment: diff } },
	// 			});

	// 			if (reserved.count === 0) {
	// 				const spotsLeft = Math.max(0, event.maxParticipants - event.currentParticipants);
	// 				throw new ConflictException(
	// 					spotsLeft === 0 ? 'No spots available' : `Only ${spotsLeft} spots available`,
	// 				);
	// 			}
	// 		} else {
	// 			const released = await tx.event.updateMany({
	// 				where: {
	// 					id: booking.eventId,
	// 					currentParticipants: { gte: -diff },
	// 				},
	// 				data: { currentParticipants: { decrement: -diff } },
	// 			});

	// 			if (released.count === 0) {
	// 				throw new ConflictException('Unable to release spots');
	// 			}
	// 		}

	// 		return tx.booking.update({ where: { id: bookingId }, data: { quantity } });
	// 	});
	// }

	async findByUser(userId: string): Promise<BookingWithEstimate[]> {
		const bookings = await this.prisma.booking.findMany({
			where: { userId, status: 'CONFIRMED' },
			include: { event: { include: { images: true, cancellationRules: true } } },
			orderBy: { createdAt: 'desc' },
		});

		const now = new Date();
		const enrichedBookings = await Promise.all(
			bookings.map(async (booking) => {
				const event = booking.event;
				if (!event || !booking.paymentIntentId || Number(booking.amount) === 0) {
					return {
						...booking,
						amount: Number(booking.amount),
						event: event ? { ...event, price: Number(event.price) } : undefined,
						refundPercentage: 0,
						estimatedStripeFeeInCents: 0,
						estimatedRefundInCents: 0,
					} as unknown as BookingWithEstimate;
				}

				// Get actual Stripe fee from payment intent
				let stripeFeeInCents = 0;
				try {
					const paymentIntent = await this.stripe.retrievePaymentIntent(booking.paymentIntentId);
					if (paymentIntent.status === 'succeeded' && paymentIntent.latest_charge) {
						const charge = await this.stripe.getCharge(paymentIntent.latest_charge as string);
						const balanceTx = charge.balance_transaction as StripeBalanceTransaction;
						if (balanceTx && typeof balanceTx === 'object' && 'fee' in balanceTx) {
							stripeFeeInCents = (balanceTx as StripeBalanceTransaction).fee;
						}
					}
				} catch (error) {
					this.logger.warn(`Failed to get Stripe fee for booking ${booking.id}, using estimate`, error);
				}

				const refundPercentage = this.calculateRefundPercentage(
					now,
					new Date(event.date),
					event.cancellationRules,
				);
				const baseAmountInCents = Math.round(Number(booking.amount) * 100);
				const calculatedRefundInCents = Math.round((baseAmountInCents * refundPercentage) / 100);

				// Use actual Stripe fee if available, otherwise use estimate (2.9% + $0.30)
				const estimatedStripeFeeInCents =
					stripeFeeInCents > 0 ? stripeFeeInCents : Math.round(baseAmountInCents * 0.029) + 30;

				const estimatedRefundInCents = Math.max(0, calculatedRefundInCents - estimatedStripeFeeInCents);

				return {
					...booking,
					amount: Number(booking.amount),
					event: { ...event, price: Number(event.price) },
					refundPercentage,
					estimatedStripeFeeInCents,
					estimatedRefundInCents,
				} as unknown as BookingWithEstimate;
			}),
		);

		return enrichedBookings;
	}

	async cancel(userId: string, bookingId: string) {
		const { booking, event } = await this.prisma.$transaction(async (tx) => {
			const currentBooking = await tx.booking.findUnique({
				where: { id: bookingId },
				include: { event: { include: { cancellationRules: true } } },
			});

			if (!currentBooking) throw new NotFoundException('Booking not found');
			if (currentBooking.userId !== userId) throw new ForbiddenException('Not your booking');
			if (currentBooking.status === 'CANCELLED') {
				return { booking: currentBooking, event: currentBooking.event };
			}

			await tx.event.updateMany({
				where: { id: currentBooking.eventId, currentParticipants: { gte: currentBooking.quantity } },
				data: { currentParticipants: { decrement: currentBooking.quantity } },
			});

			const updatedBooking = await tx.booking.update({
				where: { id: bookingId },
				data: { status: 'CANCELLED' },
			});

			return { booking: updatedBooking, event: currentBooking.event };
		});

		if (!booking.paymentIntentId || Number(booking.amount) === 0) {
			return booking;
		}

		let refundResult: { amount: number; id: string } | null = null;

		try {
			const paymentIntent = await this.stripe.retrievePaymentIntent(booking.paymentIntentId);

			if (paymentIntent.status === 'succeeded') {
				const refundPercentage = this.calculateRefundPercentage(
					new Date(),
					new Date(event.date),
					event.cancellationRules,
				);

				if (refundPercentage > 0) {
					const charge = await this.stripe.getCharge(paymentIntent.latest_charge as string);
					const balanceTx = charge.balance_transaction as StripeBalanceTransaction;
					const stripeFeeInCents = balanceTx.fee;

					const baseAmountInCents = Math.round(Number(booking.amount) * 100);
					const calculatedRefundInCents = Math.round((baseAmountInCents * refundPercentage) / 100);

					const finalRefundAmountInCents = calculatedRefundInCents - stripeFeeInCents;

					if (finalRefundAmountInCents > 0) {
						const refund = await this.stripe.refund(
							booking.paymentIntentId,
							`refund-${booking.paymentIntentId}-${finalRefundAmountInCents}`,
							finalRefundAmountInCents,
						);
						refundResult = { amount: refund.amount, id: refund.id };
					}
				}
			} else if (
				CANCELABLE_PAYMENT_INTENT_STATUSES.includes(
					paymentIntent.status as CancelablePaymentIntentStatus,
				)
			) {
				await this.stripe.cancelPaymentIntent(
					booking.paymentIntentId,
					`cancel-${booking.paymentIntentId}`,
				);
			}
		} catch (stripeError) {
			this.logger.error(`Stripe refund failed for booking ${bookingId}:`, stripeError);
		}

		if (refundResult) {
			await this.prisma.bookingAdjustment.upsert({
				where: { stripePaymentIntentId: booking.paymentIntentId },
				create: {
					bookingId: booking.id,
					type: 'REFUND',
					amount: new Prisma.Decimal((refundResult.amount / 100).toString()),
					currency: 'usd',
					stripePaymentIntentId: booking.paymentIntentId,
					stripeRefundId: refundResult.id,
					status: 'SUCCEEDED',
					reason: 'Booking cancelled. Stripe fee withheld.',
				},
				update: {
					stripeRefundId: refundResult.id,
					status: 'SUCCEEDED',
				},
			});
		}

		return booking;
	}

	private calculateRefundPercentage(
		now: Date,
		eventDate: Date,
		rules: CancellationPolicyRule[],
	): number {
		const msLeft = eventDate.getTime() - now.getTime();
		const hoursLeft = msLeft / (1000 * 60 * 60); // ms to hours

		if (hoursLeft <= 0) return 0;

		const sortedRules = [...rules].sort((a, b) => b.hoursBeforeEvent - a.hoursBeforeEvent);

		for (const rule of sortedRules) {
			if (hoursLeft >= rule.hoursBeforeEvent) {
				return rule.refundPercentage;
			}
		}

		return rules.length > 0 ? 0 : 100;
	}

	private async releasePendingBooking(
		bookingId: string,
		eventId: string,
		quantity: number,
	): Promise<void> {
		await this.prisma.$transaction(async (tx) => {
			await tx.event.updateMany({
				where: {
					id: eventId,
					currentParticipants: { gte: quantity },
				},
				data: { currentParticipants: { decrement: quantity } },
			});

			await tx.booking.update({
				where: { id: bookingId },
				data: { status: 'CANCELLED', paymentIntentId: null },
			});
		});
	}

	private rethrowStripeError(error: unknown): never {
		if (
			error &&
			typeof error === 'object' &&
			'type' in error &&
			(error as { type: string }).type === 'StripeConnectionError'
		) {
			throw new ServiceUnavailableException(
				'Payment service is unavailable. Check your internet connection and try again.',
			);
		}

		throw error;
	}
}
