import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { BookingService } from '../booking/booking.service';
import { MailService } from '@infra/mail/mail.service';
import { DEFAULT_LOCALE } from '@infra/mail/mail-strings';
import {
	AppErrorCode,
	CancelOccurrenceData,
	RescheduleOccurrenceData,
	compactCancellationReasons,
	pickCancellationReason,
} from '@event-space/shared';
import { AppException } from '@shared';

const MAIL_BATCH_SIZE = 5;

const RESCHEDULE_REFUND_DAYS = 5;
const DAY = 24 * 60 * 60 * 1000;

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
			where: { occurrenceId, status: { not: 'CANCELLED' } },
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
		const reasons = compactCancellationReasons(data.reasons);

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
			data: {
				status: 'CANCELLED',
				cancelledAt: new Date(),
				cancelReasonRu: reasons?.ru ?? null,
				cancelReasonEn: reasons?.en ?? null,
				cancelReasonHy: reasons?.hy ?? null,
			},
		});

		for (const booking of bookingsSnapshot) {
			if (booking.user?.email) {
				const locale = booking.user.locale ?? DEFAULT_LOCALE;
				const eventTitle =
					occurrence.event.translations.find((t) => t.locale === locale)?.title ??
					occurrence.event.translations[0]?.title ??
					'Event';
				// TODO: remove AMD hardcoding
				const refundAmount = `${Number(booking.amount).toFixed(2)} AMD`;
				await this.mailService.sendEventCancelledEmail({
					email: booking.user.email,
					userName: booking.user.name || 'User',
					eventTitle,
					eventDate: occurrence.date,
					refundAmount,
					locale,
					cancellationReason: pickCancellationReason(reasons, locale),
					brandHost: booking.brandHost ?? undefined,
				});
			}
		}

		return updated;
	}

	async reschedule(occurrenceId: string, data: RescheduleOccurrenceData) {
		const date = new Date(data.date);
		const reasons = compactCancellationReasons(data.reasons);

		const occurrence = await this.prisma.eventOccurrence.findUnique({
			where: { id: occurrenceId },
			select: {
				id: true,
				eventId: true,
				date: true,
				status: true,
				event: { select: { translations: true } },
			},
		});

		if (!occurrence) {
			throw new AppException(AppErrorCode.OCCURRENCE_NOT_FOUND, { id: occurrenceId });
		}

		if (occurrence.status === 'CANCELLED') {
			throw new AppException(AppErrorCode.OCCURRENCE_CANCELLED, { id: occurrenceId });
		}

		if (occurrence.date.getTime() === date.getTime()) {
			return this.prisma.eventOccurrence.findUniqueOrThrow({ where: { id: occurrenceId } });
		}

		if (date.getTime() <= Date.now()) {
			throw new AppException(AppErrorCode.OCCURRENCE_IN_PAST);
		}

		const taken = await this.prisma.eventOccurrence.findFirst({
			where: { eventId: occurrence.eventId, date, id: { not: occurrenceId } },
			select: { id: true },
		});

		if (taken) {
			throw new AppException(AppErrorCode.OCCURRENCE_DATE_TAKEN);
		}

		let refundDeadline: Date | null = null;

		const result = await this.prisma.$transaction(async (tx) => {
			const movedRows = await tx.eventOccurrence.updateMany({
				where: { id: occurrenceId, date: occurrence.date, status: 'ACTIVE' },
				data: { date, previousDate: occurrence.date, rescheduledAt: new Date() },
			});

			if (movedRows.count === 0) {
				throw new AppException(AppErrorCode.OCCURRENCE_CHANGED_CONCURRENTLY, { id: occurrenceId });
			}

			await tx.booking.updateMany({
				where: { occurrenceId, status: { in: ['PENDING', 'CONFIRMED'] } },
				data: { reminderSentAt: null },
			});

			const refundUntil = new Date(
				Math.min(Date.now() + RESCHEDULE_REFUND_DAYS * DAY, date.getTime()),
			);

			await tx.booking.updateMany({
				where: { occurrenceId, status: 'CONFIRMED' },
				data: { rescheduleRefundUntil: refundUntil },
			});

			refundDeadline = refundUntil;

			const notify = await tx.booking.findMany({
				where: { occurrenceId, status: { in: ['PENDING', 'CONFIRMED'] } },
				select: {
					status: true,
					brandHost: true,
					user: { select: { email: true, name: true, locale: true } },
				},
			});

			const moved = await tx.eventOccurrence.findUniqueOrThrow({ where: { id: occurrenceId } });

			return { moved, notify };
		});

		const recipients = result.notify.filter((booking) => booking.user?.email);

		for (let from = 0; from < recipients.length; from += MAIL_BATCH_SIZE) {
			await Promise.all(
				recipients.slice(from, from + MAIL_BATCH_SIZE).map((booking) => {
					const locale = booking.user?.locale ?? DEFAULT_LOCALE;
					const eventTitle =
						occurrence.event?.translations.find((translation) => translation.locale === locale)?.title ??
						occurrence.event?.translations[0]?.title ??
						'Event';

					return this.mailService.sendOccurrenceRescheduledEmail({
						email: booking.user?.email as string,
						userName: booking.user?.name || 'User',
						eventTitle,
						previousDate: occurrence.date,
						newDate: date,
						locale,
						reason: pickCancellationReason(reasons, locale),
						refundUntil: booking.status === 'CONFIRMED' ? refundDeadline : null,
						brandHost: booking.brandHost ?? undefined,
					});
				}),
			);
		}

		return result.moved;
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

		const toUpdate: OccurrenceInput[] = [
			...incomingWithId,
			...matchedFromDate.map((o) => ({
				...o,
				id: existingByDate.get(new Date(o.date).getTime()),
			})),
		];

		const toCreate = incomingWithoutId.filter((o) => !existingByDate.has(new Date(o.date).getTime()));

		// Remove only those existing occurrences that are neither referenced by id
		// in the incoming payload nor matched by date with an incoming item.
		const incomingDates = new Set(incoming.map((o) => new Date(o.date).getTime()));
		const toRemove = existing.filter(
			(o) => !incomingIdSet.has(o.id) && !incomingDates.has(new Date(o.date).getTime()),
		);

		if (toRemove.length) {
			const activeBookingsCount = await tx.booking.count({
				where: {
					occurrenceId: { in: toRemove.map((o) => o.id) },
					status: { not: 'CANCELLED' },
				},
			});
			if (activeBookingsCount > 0) {
				throw new AppException(AppErrorCode.OCCURRENCES_HAVE_BOOKINGS);
			}
			await tx.eventOccurrence.deleteMany({ where: { id: { in: toRemove.map((o) => o.id) } } });
		}

		const movedIds = toUpdate
			.filter((occ) => {
				const current = existing.find((e) => e.id === occ.id);
				return (
					current &&
					current.status !== 'CANCELLED' &&
					new Date(current.date).getTime() !== new Date(occ.date).getTime()
				);
			})
			.map((occ) => occ.id!);

		if (movedIds.length) {
			const bookedMoved = await tx.booking.count({
				where: { occurrenceId: { in: movedIds }, status: { not: 'CANCELLED' } },
			});
			if (bookedMoved > 0) {
				throw new AppException(AppErrorCode.OCCURRENCE_DATE_LOCKED);
			}
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
