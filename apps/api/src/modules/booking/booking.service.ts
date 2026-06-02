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
			if (event.status !== 'PUBLISHED') {
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

			const upserted = await tx.booking.upsert({
				where: { userId_eventId: { userId, eventId } },
				update: { status: 'PENDING', quantity, paymentIntentId: null, amount },
				create: { userId, eventId, status: 'PENDING', quantity, amount },
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

	async findByUser(userId: string) {
		return this.prisma.booking.findMany({
			where: { userId, status: { not: 'CANCELLED' } },
			include: { event: { include: { images: true } } },
			orderBy: { createdAt: 'desc' },
		});
	}

	async cancel(userId: string, bookingId: string) {
		const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
		if (!booking) throw new NotFoundException('Booking not found');
		if (booking.userId !== userId) throw new ForbiddenException('Not your booking');
		if (booking.status === 'CANCELLED') throw new ConflictException('Already cancelled');

		let refundResult: { amount: number; id: string } | null = null;

		if (booking.paymentIntentId) {
			const paymentIntent = await this.stripe.retrievePaymentIntent(booking.paymentIntentId);

			if (paymentIntent.status === 'succeeded') {
				const charge = await this.stripe.getCharge(paymentIntent.latest_charge as string);
				const balanceTx = charge.balance_transaction as StripeBalanceTransaction;
				const refundAmount = Number(booking.amount) - balanceTx.fee / 100;
				const amountInCents = Math.round(refundAmount * 100);

				const refund = await this.stripe.refund(
					booking.paymentIntentId,
					`refund-${booking.paymentIntentId}-${amountInCents}`,
					amountInCents,
				);

				refundResult = { amount: refund.amount, id: refund.id };
			} else if (
				CANCELABLE_PAYMENT_INTENT_STATUSES.includes(
					paymentIntent.status as CancelablePaymentIntentStatus,
				)
			) {
				await this.stripe.cancelPaymentIntent(booking.paymentIntentId, `cancel-${booking.id}`);
			} else {
				const refundAmountInCents = Math.round(Number(booking.amount) * 100);
				const refund = await this.stripe.refund(
					booking.paymentIntentId,
					`refund-${booking.paymentIntentId}-${refundAmountInCents}`,
					refundAmountInCents,
				);

				refundResult = { amount: refund.amount, id: refund.id };
			}
		}

		const cancelledBooking = await this.prisma.$transaction(async (tx) => {
			const latestBooking = await tx.booking.findUnique({ where: { id: bookingId } });
			if (!latestBooking) throw new NotFoundException('Booking not found');
			if (latestBooking.status === 'CANCELLED') throw new ConflictException('Already cancelled');

			const released = await tx.event.updateMany({
				where: {
					id: latestBooking.eventId,
					currentParticipants: { gte: latestBooking.quantity },
				},
				data: { currentParticipants: { decrement: latestBooking.quantity } },
			});

			if (released.count === 0) {
				throw new ConflictException('Unable to release spots');
			}

			return tx.booking.update({
				where: { id: bookingId },
				data: { status: 'CANCELLED' },
			});
		});

		if (refundResult) {
			await this.prisma.bookingAdjustment.create({
				data: {
					bookingId: cancelledBooking.id,
					type: 'REFUND',
					amount: new Prisma.Decimal((refundResult.amount / 100).toString()),
					currency: 'usd',
					stripePaymentIntentId: booking.paymentIntentId,
					stripeRefundId: refundResult.id,
					status: 'SUCCEEDED',
					reason: 'Booking cancelled',
				},
			});
		}

		return cancelledBooking;
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
