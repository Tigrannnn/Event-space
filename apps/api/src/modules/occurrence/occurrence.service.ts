import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { BookingService } from '../booking/booking.service';
import { MailService } from '@infra/mail/mail.service';
import { AppErrorCode, CancelOccurrenceData } from '@event-space/shared';
import { AppException } from '@shared';

interface OccurrenceInput {
	id?: string;
	date: Date;
	maxParticipants?: number;
}

@Injectable()
export class OccurrenceService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly bookingService: BookingService,
		private readonly mailService: MailService,
	) {}

	async assertCanDelete(occurrenceId: string) {
		const count = await this.prisma.booking.count({
			where: { occurrenceId, status: { not: { in: ['CANCELLED', 'EXPIRED'] } } },
		});
		if (count > 0) {
			throw new AppException(AppErrorCode.OCCURRENCE_HAS_BOOKINGS, { occurrenceId });
		}
	}

	async delete(occurrenceId: string) {
		await this.assertCanDelete(occurrenceId);
		return this.prisma.eventOccurrence.delete({ where: { id: occurrenceId } });
	}

	async cancel(occurrenceId: string, data: CancelOccurrenceData) {
		const { reason } = data;

		const occurrence = await this.prisma.eventOccurrence.findUnique({
			where: { id: occurrenceId },
			include: {
				event: { include: { translations: true } },
				bookings: {
					where: { status: { in: ['PENDING', 'CONFIRMED'] } },
					include: { user: true },
				},
			},
		});

		if (!occurrence) {
			throw new AppException(AppErrorCode.OCCURRENCE_NOT_FOUND, { id: occurrenceId });
		}

		if (occurrence.status === 'CANCELLED') {
			return occurrence;
		}

		const bookingsSnapshot = occurrence.bookings;

		await this.bookingService.cancelOccurrenceBookings(occurrenceId);

		const updated = await this.prisma.eventOccurrence.update({
			where: { id: occurrenceId },
			data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: reason },
		});

		const eventTitle = occurrence.event.translations[0]?.title ?? 'Event';

		for (const booking of bookingsSnapshot) {
			if (booking.user?.email) {
				// TODO: remove AMD hardcoding
				const refundAmount = `${Number(booking.amount).toFixed(2)} AMD`;
				await this.mailService.sendEventCancelledEmail(
					booking.user.email,
					booking.user.name || 'User',
					eventTitle,
					occurrence.date,
					refundAmount,
					reason,
				);
			}
		}

		return updated;
	}

	async syncForEvent(
		eventId: string,
		existing: { id: string; status: string; date: Date }[],
		incoming: OccurrenceInput[],
		tx: Prisma.TransactionClient,
	) {
		// Build helper maps/sets to match incoming occurrences with existing ones.
		const incomingWithId = incoming.filter((o) => o.id);
		const incomingWithoutId = incoming.filter((o) => !o.id);

		const incomingIdSet = new Set(incomingWithId.map((o) => o.id));

		// Map existing occurrences by their date (time value) so an incoming item
		// without `id` but with the same date will be treated as an update rather
		// than a creation/deletion. This guards against frontends that omit ids.
		const existingByDate = new Map<number, string>();
		for (const e of existing) {
			const d = e.date;
			if (d) existingByDate.set(new Date(d).getTime(), e.id);
		}

		// Incoming items without id that match existing by date should be updated.
		const matchedFromDate = incomingWithoutId.filter((o) =>
			existingByDate.has(new Date(o.date).getTime()),
		);

		const toUpdate = [
			...incomingWithId,
			...matchedFromDate.map((o) => ({ ...(o as any), id: existingByDate.get(new Date(o.date).getTime()) })),
		];

		const toCreate = incomingWithoutId.filter(
			(o) => !existingByDate.has(new Date(o.date).getTime()),
		);

		// Remove only those existing occurrences that are neither referenced by id
		// in the incoming payload nor matched by date with an incoming item.
		const toRemove = existing.filter(
			(o) => !incomingIdSet.has(o.id) && !existingByDate.has(new Date(o.date).getTime()),
		);

		if (toRemove.length) {
			const activeBookingsCount = await tx.booking.count({
				where: {
					occurrenceId: { in: toRemove.map((o) => o.id) },
					status: { not: { in: ['CANCELLED', 'EXPIRED'] } },
				},
			});
			if (activeBookingsCount > 0) {
				throw new AppException(AppErrorCode.OCCURRENCES_HAVE_BOOKINGS);
			}
			await tx.eventOccurrence.deleteMany({ where: { id: { in: toRemove.map((o) => o.id) } } });
		}

		for (const occ of toUpdate) {
			const current = existing.find((e) => e.id === occ.id);
			if (current?.status === 'CANCELLED') continue;

			await tx.eventOccurrence.update({
				where: { id: occ.id! },
				data: { date: occ.date, maxParticipants: occ.maxParticipants ?? 100 },
			});
		}

		if (toCreate.length) {
			await tx.eventOccurrence.createMany({
				data: toCreate.map((o) => ({
					eventId,
					date: o.date,
					maxParticipants: o.maxParticipants ?? 100,
				})),
			});
		}
	}
}
