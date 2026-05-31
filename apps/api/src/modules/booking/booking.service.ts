import {
	Injectable,
	NotFoundException,
	ConflictException,
	ForbiddenException,
	ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { CreateBookingData, UpdateBookingData } from '@event-space/shared';
import { StripeService } from '@infra/stripe/stripe.service';

@Injectable()
export class BookingService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly stripe: StripeService,
	) {}

	async create(userId: string, data: CreateBookingData) {
		const { eventId, quantity = 1 } = data;

		const { booking, amount } = await this.prisma.$transaction(async (tx) => {
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

			const upserted = await tx.booking.upsert({
				where: { userId_eventId: { userId, eventId } },
				update: { status: 'PENDING', quantity, paymentIntentId: null },
				create: { userId, eventId, status: 'PENDING', quantity },
			});

			return { booking: upserted, amount: Number(event.price) * quantity };
		});

		try {
			const paymentIntent = await this.stripe.createPaymentIntent(amount, 'usd', {
				userId,
				eventId,
			});

			const updatedBooking = await this.prisma.booking.update({
				where: { id: booking.id },
				data: { paymentIntentId: paymentIntent.id },
			});

			return { booking: updatedBooking, clientSecret: paymentIntent.client_secret };
		} catch (error) {
			await this.releasePendingBooking(booking.id, eventId, quantity);
			this.rethrowStripeError(error);
		}
	}

	async update(userId: string, bookingId: string, data: UpdateBookingData) {
		const { quantity } = data;

		return this.prisma.$transaction(async (tx) => {
			const booking = await tx.booking.findUnique({ where: { id: bookingId } });
			if (!booking) throw new NotFoundException('Booking not found');
			if (booking.userId !== userId) throw new ForbiddenException('Not your booking');
			if (booking.status === 'CANCELLED') {
				throw new ConflictException('Cannot update cancelled booking');
			}

			const diff = quantity - booking.quantity;
			if (diff === 0) return booking;

			if (diff > 0) {
				const event = await tx.event.findUnique({ where: { id: booking.eventId } });
				if (!event) throw new NotFoundException('Event not found');

				const reserved = await tx.event.updateMany({
					where: {
						id: booking.eventId,
						status: 'PUBLISHED',
						currentParticipants: { lte: event.maxParticipants - diff },
					},
					data: { currentParticipants: { increment: diff } },
				});

				if (reserved.count === 0) {
					const spotsLeft = Math.max(0, event.maxParticipants - event.currentParticipants);
					throw new ConflictException(
						spotsLeft === 0 ? 'No spots available' : `Only ${spotsLeft} spots available`,
					);
				}
			} else {
				const released = await tx.event.updateMany({
					where: {
						id: booking.eventId,
						currentParticipants: { gte: -diff },
					},
					data: { currentParticipants: { decrement: -diff } },
				});

				if (released.count === 0) {
					throw new ConflictException('Unable to release spots');
				}
			}

			return tx.booking.update({ where: { id: bookingId }, data: { quantity } });
		});
	}

	async findByUser(userId: string) {
		return this.prisma.booking.findMany({
			where: { userId, status: { not: 'CANCELLED' } },
			include: { event: { include: { images: true } } },
			orderBy: { createdAt: 'desc' },
		});
	}

	async cancel(userId: string, bookingId: string) {
		return this.prisma.$transaction(async (tx) => {
			const booking = await tx.booking.findUnique({ where: { id: bookingId } });
			if (!booking) throw new NotFoundException('Booking not found');
			if (booking.userId !== userId) throw new ForbiddenException('Not your booking');
			if (booking.status === 'CANCELLED') throw new ConflictException('Already cancelled');

			if (booking.status === 'CONFIRMED' && booking.paymentIntentId) {
				await this.stripe.refund(booking.paymentIntentId);
			} else if (booking.status === 'PENDING' && booking.paymentIntentId) {
				await this.stripe.cancelPaymentIntent(booking.paymentIntentId);
			}

			const released = await tx.event.updateMany({
				where: {
					id: booking.eventId,
					currentParticipants: { gte: booking.quantity },
				},
				data: { currentParticipants: { decrement: booking.quantity } },
			});

			if (released.count === 0) {
				throw new ConflictException('Unable to release spots');
			}

			return tx.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED' } });
		});
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
