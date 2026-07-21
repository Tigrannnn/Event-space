import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { BookingService } from '../booking/booking.service';
import { MailService } from '@infra/mail/mail.service';
import { CancelOccurrenceData } from '@event-space/shared';

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
			throw new ConflictException({
				code: 'OCCURRENCE_HAS_BOOKINGS',
				occurrenceId,
				message: 'Occurrence has active bookings, cancel it instead of deleting',
			});
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
			throw new NotFoundException(`Occurrence with ID ${occurrenceId} not found`);
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
		existing: { id: string }[],
		incoming: OccurrenceInput[],
		tx: Prisma.TransactionClient,
	) {
		const incomingIds = new Set(incoming.filter((o) => o.id).map((o) => o.id));
		const toRemove = existing.filter((o) => !incomingIds.has(o.id));
		const toUpdate = incoming.filter((o) => o.id);
		const toCreate = incoming.filter((o) => !o.id);

		if (toRemove.length) {
			const activeBookingsCount = await tx.booking.count({
				where: {
					occurrenceId: { in: toRemove.map((o) => o.id) },
					status: { not: { in: ['CANCELLED', 'EXPIRED'] } },
				},
			});
			if (activeBookingsCount > 0) {
				throw new ConflictException({
					code: 'OCCURRENCE_HAS_BOOKINGS',
					message:
						'One or more occurrences being removed have active bookings, cancel them explicitly first',
				});
			}
			await tx.eventOccurrence.deleteMany({ where: { id: { in: toRemove.map((o) => o.id) } } });
		}

		for (const occ of toUpdate) {
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
