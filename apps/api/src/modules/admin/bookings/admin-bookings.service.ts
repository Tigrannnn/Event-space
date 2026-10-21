import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { AppException } from '@shared';
import { AppErrorCode } from '@event-space/shared';
import type { BookingWithDetails, PaginatedParams } from '@event-space/shared';
import { bookingInclude } from '../common/admin-selects';
import { normalizeBookingResponse } from '../common/booking-response';
import { toPage } from '../common/query-helpers';
import { buildBookingsWhere, type BookingFilters } from './booking-filters';

type FindAllBookingsParams = PaginatedParams & BookingFilters;

@Injectable()
export class AdminBookingsService {
	private readonly logger = new Logger(AdminBookingsService.name);

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
		const admins = await this.loadAdmins(page.data);

		return {
			...page,
			data: page.data.map((booking) =>
				normalizeBookingResponse({ ...booking, createdByAdmin: admins.get(booking.createdByAdminId) }),
			),
		};
	}

	async findOne(id: string): Promise<BookingWithDetails | null> {
		const booking = await this.prisma.booking.findUnique({
			where: { id },
			include: bookingInclude,
		});
		if (!booking) return null;

		const admins = await this.loadAdmins([booking]);

		return normalizeBookingResponse({
			...booking,
			createdByAdmin: admins.get(booking.createdByAdminId),
		});
	}

	private async loadAdmins(bookings: { createdByAdminId: string | null }[]) {
		const ids = [...new Set(bookings.map((row) => row.createdByAdminId).filter(Boolean))] as string[];
		if (ids.length === 0) return new Map<string | null, { id: string; name: string | null }>();

		const admins = await this.prisma.user.findMany({
			where: { id: { in: ids } },
			select: { id: true, name: true },
		});

		return new Map<string | null, { id: string; name: string | null }>(
			admins.map((admin) => [admin.id, admin]),
		);
	}

	async findByReference(referenceNumber: number) {
		const booking = await this.prisma.booking.findUnique({
			where: { referenceNumber },
			include: bookingInclude,
		});
		if (!booking) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);

		return booking;
	}

	async checkIn(bookingId: string, adminId: string) {
		const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
		if (!booking) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
		if (booking.status !== 'CONFIRMED') throw new AppException(AppErrorCode.BOOKING_NOT_CONFIRMED);
		if (booking.checkedInAt) throw new AppException(AppErrorCode.ALREADY_CHECKED_IN);

		const checkedIn = await this.prisma.booking.update({
			where: { id: bookingId },
			data: { checkedInAt: new Date() },
			include: bookingInclude,
		});

		this.logger.log(
			`Admin ${adminId} checked in booking ${bookingId} at ${checkedIn.checkedInAt?.toISOString()}`,
		);

		return checkedIn;
	}

	async undoCheckIn(bookingId: string, adminId: string) {
		const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
		if (!booking) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
		if (!booking.checkedInAt) throw new AppException(AppErrorCode.NOT_CHECKED_IN);

		const reverted = await this.prisma.booking.update({
			where: { id: bookingId },
			data: { checkedInAt: null },
			include: bookingInclude,
		});

		this.logger.log(
			`Admin ${adminId} undid the check-in of booking ${bookingId}, made at ${booking.checkedInAt.toISOString()}`,
		);

		return reverted;
	}
}
