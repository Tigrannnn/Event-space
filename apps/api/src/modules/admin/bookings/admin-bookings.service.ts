import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { MailService } from '@infra/mail/mail.service';
import { DEFAULT_LOCALE } from '@infra/mail/mail-strings';
import { AppException } from '@shared';
import { AppErrorCode } from '@event-space/shared';
import type { BookingWithDetails, PaginatedParams, TransferBookingData } from '@event-space/shared';
import { bookingInclude } from '../common/admin-selects';
import { normalizeBookingResponse } from '../common/booking-response';
import { toPage } from '../common/query-helpers';
import { buildBookingsWhere, type BookingFilters } from './booking-filters';
import { reserveSeats, releaseSeats } from '@modules/booking/occurrence-seats';

type FindAllBookingsParams = PaginatedParams & BookingFilters;

const RESCHEDULE_REFUND_DAYS = 5;
const DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class AdminBookingsService {
	private readonly logger = new Logger(AdminBookingsService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly mailService: MailService,
	) {}

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

	/**
	 * Moves one booking to a different date of the *same* tour — not the occurrence-reschedule
	 * feature, which moves everyone on a date at once. Money is untouched: the customer still
	 * owes and has paid exactly what they already paid, only which date they attend changes.
	 *
	 * Reuses the same customer-facing promise an occurrence reschedule makes: a window to get a
	 * full refund if the new date does not suit them, and the same email, since from the
	 * customer's side "my booking moved to a new date" reads the same either way.
	 */
	async transferOccurrence(bookingId: string, data: TransferBookingData) {
		const booking = await this.prisma.booking.findUnique({
			where: { id: bookingId },
			include: {
				occurrence: { include: { event: { include: { translations: true } } } },
				user: { select: { email: true, name: true, locale: true } },
			},
		});

		if (!booking) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
		if (booking.status !== 'CONFIRMED') throw new AppException(AppErrorCode.BOOKING_NOT_CONFIRMED);
		if (booking.checkedInAt) throw new AppException(AppErrorCode.ALREADY_CHECKED_IN);

		const fromOccurrence = booking.occurrence;
		if (!fromOccurrence) throw new AppException(AppErrorCode.OCCURRENCE_NOT_FOUND);

		if (data.occurrenceId === booking.occurrenceId) {
			throw new AppException(AppErrorCode.BOOKING_TRANSFER_SAME_OCCURRENCE);
		}

		const toOccurrence = await this.prisma.eventOccurrence.findUnique({
			where: { id: data.occurrenceId },
		});
		if (!toOccurrence) {
			throw new AppException(AppErrorCode.OCCURRENCE_NOT_FOUND, { id: data.occurrenceId });
		}
		if (toOccurrence.eventId !== fromOccurrence.eventId) {
			throw new AppException(AppErrorCode.BOOKING_TRANSFER_DIFFERENT_EVENT);
		}
		if (toOccurrence.status !== 'ACTIVE' || toOccurrence.date.getTime() <= Date.now()) {
			throw new AppException(AppErrorCode.OCCURRENCE_IN_PAST);
		}

		const refundUntil = new Date(
			Math.min(Date.now() + RESCHEDULE_REFUND_DAYS * DAY, toOccurrence.date.getTime()),
		);

		await this.prisma.$transaction(async (tx) => {
			await releaseSeats(tx, booking.occurrenceId, booking.quantity);
			await reserveSeats(tx, toOccurrence, booking.quantity);

			await tx.booking.update({
				where: { id: bookingId },
				data: {
					occurrenceId: toOccurrence.id,
					rescheduleRefundUntil: refundUntil,
					rescheduleAcceptedAt: null,
					reminderSentAt: null,
				},
			});
		});

		if (booking.user?.email) {
			const locale = booking.user.locale ?? DEFAULT_LOCALE;
			const eventTitle =
				fromOccurrence.event.translations.find((t) => t.locale === locale)?.title ??
				fromOccurrence.event.translations[0]?.title ??
				'Event';

			await this.mailService.sendOccurrenceRescheduledEmail({
				email: booking.user.email,
				userName: booking.user.name || 'User',
				eventTitle,
				previousDate: fromOccurrence.date,
				newDate: toOccurrence.date,
				locale,
				reason: data.reason,
				refundUntil,
				brandHost: booking.brandHost ?? undefined,
			});
		}

		return this.findOne(bookingId);
	}
}
