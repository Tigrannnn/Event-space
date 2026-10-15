import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@infra/prisma/prisma.service';
import { MailService } from '@infra/mail/mail.service';
import { DEFAULT_LOCALE } from '@infra/mail/mail-strings';

const HOUR = 60 * 60 * 1000;
const REMINDER_MAX_HOURS_BEFORE_START = 26;
const REMINDER_MIN_HOURS_BEFORE_START = 20;
const MIN_HOURS_AFTER_BOOKING = 6;
const BATCH_SIZE = 200;

const REMINDER_INCLUDE = {
	user: true,
	occurrence: { include: { event: { include: { translations: true } } } },
} satisfies Prisma.BookingInclude;

type ReminderBooking = Prisma.BookingGetPayload<{ include: typeof REMINDER_INCLUDE }>;

@Injectable()
export class BookingReminderService {
	private readonly logger = new Logger(BookingReminderService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly mailService: MailService,
	) {}

	@Cron(CronExpression.EVERY_HOUR)
	async sendUpcomingReminders() {
		const now = Date.now();

		const bookings = await this.prisma.booking.findMany({
			where: {
				status: 'CONFIRMED',
				reminderSentAt: null,
				createdAt: { lte: new Date(now - MIN_HOURS_AFTER_BOOKING * HOUR) },
				user: { email: { not: null } },
				occurrence: {
					status: 'ACTIVE',
					date: {
						gte: new Date(now + REMINDER_MIN_HOURS_BEFORE_START * HOUR),
						lte: new Date(now + REMINDER_MAX_HOURS_BEFORE_START * HOUR),
					},
				},
			},
			include: REMINDER_INCLUDE,
			orderBy: { createdAt: 'asc' },
			take: BATCH_SIZE,
		});

		if (bookings.length === 0) {
			return;
		}

		this.logger.log(`Sending ${bookings.length} tour reminders`);

		for (const booking of bookings) {
			try {
				await this.sendReminder(booking);
			} catch (error) {
				this.logger.error(`Failed to send reminder for booking ${booking.id}`, error as Error);
			}
		}
	}

	private async sendReminder(booking: ReminderBooking): Promise<void> {
		const claimed = await this.prisma.booking.updateMany({
			where: { id: booking.id, reminderSentAt: null },
			data: { reminderSentAt: new Date() },
		});

		if (claimed.count === 0) {
			return;
		}

		const locale = booking.user.locale ?? DEFAULT_LOCALE;
		const event = booking.occurrence.event;
		const translation = event.translations.find((t) => t.locale === locale) ?? event.translations[0];

		const sent = await this.mailService.sendBookingReminder({
			to: booking.user.email!,
			locale,
			referenceNumber: booking.referenceNumber ?? 0,
			userName: booking.user.name,
			eventTitle: translation?.title ?? '',
			eventLocation: translation?.location,
			meetingLocation: translation?.meetingLocation,
			meetingLocationUrl: event.meetingLocationUrl,
			occurrenceDate: booking.occurrence.date,
			durationMinutes: event.duration,
			quantity: booking.quantity,
			amount: Number(booking.amount),
			currency: 'AMD',
			paymentMethod: booking.paymentMethod,
			whatsIncluded: translation?.whatsIncluded,
			brandHost: booking.brandHost ?? undefined,
		});

		if (!sent) {
			await this.prisma.booking.updateMany({
				where: { id: booking.id },
				data: { reminderSentAt: null },
			});
		}
	}
}
