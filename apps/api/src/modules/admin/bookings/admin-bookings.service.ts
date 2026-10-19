import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { AppException } from '@shared';
import { AppErrorCode } from '@event-space/shared';
import type { BookingWithDetails, PaginatedParams, UpdateBookingData } from '@event-space/shared';
import { bookingInclude } from '../common/admin-selects';
import { normalizeBookingResponse } from '../common/booking-response';
import { toPage } from '../common/query-helpers';
import { buildBookingsWhere, type BookingFilters } from './booking-filters';
import { releaseSeats, reserveSeats } from './occurrence-seats';

type FindAllBookingsParams = PaginatedParams & BookingFilters;

@Injectable()
export class AdminBookingsService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll({ skip = 0, limit = 20, ...filters }: FindAllBookingsParams = {}) {
		const where = buildBookingsWhere(filters, new Date());

		const [bookings, total] = await Promise.all([
			this.prisma.booking.findMany({
				where,
				skip,
				take: limit + 1,
				orderBy: { createdAt: 'desc' },
				include: bookingInclude,
			}),
			this.prisma.booking.count({ where }),
		]);

		const page = toPage(bookings, total, skip, limit);

		return { ...page, data: page.data.map((booking) => normalizeBookingResponse(booking)) };
	}

	async findOne(id: string): Promise<BookingWithDetails | null> {
		const booking = await this.prisma.booking.findUnique({
			where: { id },
			include: bookingInclude,
		});

		return booking ? normalizeBookingResponse(booking) : null;
	}

	async findByReference(referenceNumber: number) {
		const booking = await this.prisma.booking.findUnique({
			where: { referenceNumber },
			include: bookingInclude,
		});
		if (!booking) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);

		return booking;
	}

	async updateQuantity(id: string, data: UpdateBookingData): Promise<BookingWithDetails> {
		const booking = await this.prisma.booking.findUnique({
			where: { id },
			include: bookingInclude,
		});

		if (!booking) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
		if (booking.status === 'CANCELLED') {
			throw new AppException(AppErrorCode.BOOKING_ALREADY_CANCELLED);
		}

		const nextQuantity = data.quantity;
		const diff = nextQuantity - booking.quantity;

		if (diff === 0) return normalizeBookingResponse(booking);

		if (!booking.occurrence) throw new AppException(AppErrorCode.OCCURRENCE_NOT_FOUND);

		const event = booking.occurrence.event;
		if (!event) throw new AppException(AppErrorCode.EVENT_NOT_FOUND);

		const occurrence = booking.occurrence;

		const updated = await this.prisma.$transaction(async (tx) => {
			if (diff > 0) {
				await reserveSeats(tx, occurrence, diff);
			} else {
				await releaseSeats(tx, booking.occurrenceId, -diff);
			}

			const amount = parseFloat((Number(event.price) * nextQuantity).toFixed(2));

			return tx.booking.update({
				where: { id },
				data: { quantity: nextQuantity, amount },
				include: bookingInclude,
			});
		});

		return normalizeBookingResponse(updated);
	}

	async checkIn(bookingId: string) {
		const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
		if (!booking) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
		if (booking.status !== 'CONFIRMED') throw new AppException(AppErrorCode.BOOKING_NOT_CONFIRMED);
		if (booking.checkedInAt) throw new AppException(AppErrorCode.ALREADY_CHECKED_IN);

		return this.prisma.booking.update({
			where: { id: bookingId },
			data: { checkedInAt: new Date() },
			include: bookingInclude,
		});
	}
}
