import {
	Injectable,
	NotFoundException,
	ConflictException,
	ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { CreateBookingData, UpdateBookingData } from '@event-space/shared';

@Injectable()
export class BookingService {
	constructor(private readonly prisma: PrismaService) {}

	async create(userId: string, data: CreateBookingData) {
		const { eventId, quantity = 1 } = data;

		const event = await this.prisma.event.findUnique({ where: { id: eventId } });
		if (!event) throw new NotFoundException('Event not found');
		if (event.status !== 'PUBLISHED')
			throw new ForbiddenException('Event is not available for booking');

		const spotsLeft = event.maxParticipants - event.currentParticipants;
		if (quantity > spotsLeft) {
			throw new ConflictException(`Only ${spotsLeft} spots available`);
		}

		const existing = await this.prisma.booking.findUnique({
			where: { userId_eventId: { userId, eventId } },
		});
		if (existing && existing.status !== 'CANCELLED') {
			throw new ConflictException('Already booked');
		}

		const [booking] = await this.prisma.$transaction([
			this.prisma.booking.upsert({
				where: { userId_eventId: { userId, eventId } },
				update: { status: 'CONFIRMED', quantity },
				create: { userId, eventId, status: 'CONFIRMED', quantity },
			}),
			this.prisma.event.update({
				where: { id: eventId },
				data: { currentParticipants: { increment: quantity } },
			}),
		]);

		return booking;
	}

	async update(userId: string, bookingId: string, data: UpdateBookingData) {
		const { quantity } = data;

		const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
		if (!booking) throw new NotFoundException('Booking not found');
		if (booking.userId !== userId) throw new ForbiddenException('Not your booking');
		if (booking.status === 'CANCELLED')
			throw new ConflictException('Cannot update cancelled booking');

		const diff = quantity - booking.quantity;
		if (diff === 0) return booking;

		if (diff > 0) {
			const event = await this.prisma.event.findUnique({ where: { id: booking.eventId } });
			if (!event) throw new NotFoundException('Event not found');
			const spotsLeft = event.maxParticipants - event.currentParticipants;
			if (diff > spotsLeft) {
				throw new ConflictException(`Only ${spotsLeft} spots available`);
			}
		}

		const [updated] = await this.prisma.$transaction([
			this.prisma.booking.update({ where: { id: bookingId }, data: { quantity } }),
			this.prisma.event.update({
				where: { id: booking.eventId },
				data: { currentParticipants: { increment: diff } },
			}),
		]);

		return updated;
	}

	async findByUser(userId: string) {
		return this.prisma.booking.findMany({
			where: { userId, status: { not: 'CANCELLED' } },
			include: { event: true },
			orderBy: { createdAt: 'desc' },
		});
	}

	async cancel(userId: string, bookingId: string) {
		const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
		if (!booking) throw new NotFoundException('Booking not found');
		if (booking.userId !== userId) throw new ForbiddenException('Not your booking');
		if (booking.status === 'CANCELLED') throw new ConflictException('Already cancelled');

		const [updated] = await this.prisma.$transaction([
			this.prisma.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED' } }),
			this.prisma.event.update({
				where: { id: booking.eventId },
				data: { currentParticipants: { decrement: booking.quantity } },
			}),
		]);

		return updated;
	}
}
