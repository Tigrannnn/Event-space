import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type Locale } from '@prisma/client';
import { EnvKey } from '@event-space/shared';
import { PrismaService } from '@infra/prisma/prisma.service';
import { MailService } from '@infra/mail/mail.service';
import { DEFAULT_LOCALE } from '@infra/mail/mail-strings';
import { buildBookingLinkToken, buildCheckinToken } from '../booking.utils';

const UNSENT_MIN_AGE_MS = 5 * 60 * 1000;
const UNSENT_WINDOW_MS = 6 * 60 * 60 * 1000;
const UNSENT_BATCH_SIZE = 50;

@Injectable()
export class BookingNotificationService {
	private readonly logger = new Logger(BookingNotificationService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly mail: MailService,
		private readonly config: ConfigService,
	) {}

	async sendConfirmation(bookingId: string, locale: Locale): Promise<void> {
		const claimed = await this.prisma.booking.updateMany({
			where: { id: bookingId, confirmationSentAt: null },
			data: { confirmationSentAt: new Date() },
		});

		if (claimed.count === 0) {
			return;
		}

		let delivered = false;

		try {
			delivered = await this.deliverConfirmation(bookingId, locale);
		} catch (error) {
			this.logger.error(
				`Failed to send booking confirmation for booking ${bookingId}`,
				error as Error,
			);
		}

		if (!delivered) {
			await this.prisma.booking.updateMany({
				where: { id: bookingId },
				data: { confirmationSentAt: null },
			});
		}
	}

	async sendNoSeatsLeft(bookingId: string, locale: Locale, refundFailed: boolean): Promise<void> {
		try {
			const booking = await this.prisma.booking.findUnique({
				where: { id: bookingId },
				include: {
					user: true,
					occurrence: { include: { event: { include: { translations: true } } } },
				},
			});

			if (!booking?.user?.email) {
				return;
			}

			const mailLocale = booking.user.locale ?? locale;
			const translations = booking.occurrence.event.translations;
			const translation = translations.find((t) => t.locale === mailLocale) ?? translations[0];

			await this.mail.sendBookingNoSeatsEmail({
				to: booking.user.email,
				locale: mailLocale,
				userName: booking.user.name,
				eventTitle: translation?.title ?? '',
				occurrenceDate: booking.occurrence.date,
				refundAmount: Number(booking.amount),
				refundFailed,
				currency: 'AMD',
				brandHost: booking.brandHost ?? undefined,
			});
		} catch (error) {
			this.logger.error(`Failed to send no seats email for booking ${bookingId}`, error as Error);
		}
	}

	async retryUnsentConfirmations(now: Date = new Date()): Promise<number> {
		const bookings = await this.prisma.booking.findMany({
			where: {
				status: 'CONFIRMED',
				confirmationSentAt: null,
				user: { email: { not: null } },
				updatedAt: {
					gte: new Date(now.getTime() - UNSENT_WINDOW_MS),
					lte: new Date(now.getTime() - UNSENT_MIN_AGE_MS),
				},
			},
			select: { id: true },
			orderBy: { updatedAt: 'asc' },
			take: UNSENT_BATCH_SIZE,
		});

		for (const booking of bookings) {
			await this.sendConfirmation(booking.id, DEFAULT_LOCALE);
		}

		return bookings.length;
	}

	private async deliverConfirmation(bookingId: string, locale: Locale): Promise<boolean> {
		const booking = await this.prisma.booking.findUnique({
			where: { id: bookingId },
			include: {
				user: true,
				occurrence: {
					include: { event: { include: { translations: true, cancellationRules: true } } },
				},
			},
		});

		if (!booking?.user?.email) {
			return true;
		}

		const mailLocale = booking.user.locale ?? locale;

		const translation =
			booking.occurrence.event.translations.find((t) => t.locale === mailLocale) ??
			booking.occurrence.event.translations[0];

		const event = booking.occurrence.event;

		const checkinToken = buildCheckinToken(booking, booking.occurrence.date, {
			reviewTokenSecret: this.config.get<string>(EnvKey.REVIEW_TOKEN_SECRET),
			jwtSecret: this.config.getOrThrow<string>(EnvKey.JWT_ACCESS_SECRET),
		});

		return this.mail.sendBookingConfirmation({
			to: booking.user.email,
			locale: mailLocale,
			referenceNumber: booking.referenceNumber ?? 0,
			checkinToken,
			bookingId: booking.id,
			bookingLinkToken: buildBookingLinkToken(booking.id, booking.occurrence.date, {
				reviewTokenSecret: this.config.get<string>(EnvKey.REVIEW_TOKEN_SECRET),
				jwtSecret: this.config.getOrThrow<string>(EnvKey.JWT_ACCESS_SECRET),
			}),
			userName: booking.user.name,
			bookedAt: booking.createdAt,
			eventId: event.id,
			eventTitle: translation?.title ?? '',
			eventLocation: translation?.location,
			eventLocationUrl: event.locationUrl,
			meetingLocation: translation?.meetingLocation,
			meetingLocationUrl: event.meetingLocationUrl,
			occurrenceDate: booking.occurrence.date,
			durationMinutes: event.duration,
			quantity: booking.quantity,
			amount: Number(booking.amount),
			currency: 'AMD',
			paymentMethod: booking.paymentMethod,
			brandHost: booking.brandHost ?? undefined,
			whatsIncluded: translation?.whatsIncluded,
			cancellationRules: event.cancellationRules.map((rule) => ({
				hoursBeforeEvent: rule.hoursBeforeEvent,
				refundPercentage: rule.refundPercentage,
			})),
		});
	}

	async sendCancellation(params: {
		booking: { referenceNumber: number | null; brandHost: string | null };
		event?: { translations: { locale: Locale; title: string }[] } | null;
		occurrence?: { date: Date } | null;
		user: { email: string | null; name: string; locale: Locale | null };
		locale?: Locale;
		refundAmount?: number;
		refundFailed?: boolean;
		refundCoveredByFee?: { entitled: number; fee: number };
		nothingPaid?: boolean;
		offlinePaid?: boolean;
	}): Promise<void> {
		const { booking, event, occurrence, user } = params;

		if (!user.email || !event || !occurrence) {
			return;
		}

		const mailLocale = user.locale ?? params.locale ?? DEFAULT_LOCALE;
		const translation =
			event.translations.find((t) => t.locale === mailLocale) ?? event.translations[0];

		try {
			await this.mail.sendBookingCancelledEmail({
				to: user.email,
				locale: mailLocale,
				userName: user.name,
				referenceNumber: booking.referenceNumber ?? 0,
				eventTitle: translation?.title ?? '',
				occurrenceDate: occurrence.date,
				refundAmount: params.refundAmount,
				refundFailed: params.refundFailed,
				refundCoveredByFee: params.refundCoveredByFee,
				nothingPaid: params.nothingPaid,
				offlinePaid: params.offlinePaid,
				currency: 'AMD',
				brandHost: booking.brandHost ?? undefined,
			});
		} catch (error) {
			this.logger.error('Failed to send booking cancelled email', error as Error);
		}
	}

	async sendQuantityChanged(params: {
		booking: { referenceNumber: number | null; brandHost: string | null };
		event?: { translations: { locale: Locale; title: string }[] } | null;
		occurrence?: { date: Date } | null;
		user: { email: string | null; name: string; locale: Locale | null };
		locale?: Locale;
		oldQuantity: number;
		newQuantity: number;
		newAmount: number;
		byOrganiser: boolean;
		refund?:
			| { kind: 'refunded'; amount: number }
			| { kind: 'manual'; amount: number }
			| { kind: 'pending' }
			| { kind: 'notRefundable' };
		extra?: { kind: 'paidByCard'; amount: number };
	}): Promise<void> {
		const { booking, event, occurrence, user } = params;

		if (!user.email || !event || !occurrence) {
			return;
		}

		const mailLocale = user.locale ?? params.locale ?? DEFAULT_LOCALE;
		const translation =
			event.translations.find((t) => t.locale === mailLocale) ?? event.translations[0];

		try {
			await this.mail.sendBookingQuantityChanged({
				to: user.email,
				locale: mailLocale,
				userName: user.name,
				referenceNumber: booking.referenceNumber ?? 0,
				eventTitle: translation?.title ?? '',
				occurrenceDate: occurrence.date,
				oldQuantity: params.oldQuantity,
				newQuantity: params.newQuantity,
				newAmount: params.newAmount,
				byOrganiser: params.byOrganiser,
				refund: params.refund,
				extra: params.extra,
				currency: 'AMD',
				brandHost: booking.brandHost ?? undefined,
			});
		} catch (error) {
			this.logger.error('Failed to send booking changed email', error as Error);
		}
	}

	async sendQuantityNotAdded(params: {
		booking: { referenceNumber: number | null; brandHost: string | null };
		event?: { translations: { locale: Locale; title: string }[] } | null;
		occurrence?: { date: Date } | null;
		user: { email: string | null; name: string; locale: Locale | null };
		refundAmount: number;
	}): Promise<void> {
		const { booking, event, occurrence, user } = params;

		if (!user.email || !event || !occurrence) {
			return;
		}

		const mailLocale = user.locale ?? DEFAULT_LOCALE;
		const translation =
			event.translations.find((t) => t.locale === mailLocale) ?? event.translations[0];

		try {
			await this.mail.sendBookingQuantityNotAdded({
				to: user.email,
				locale: mailLocale,
				userName: user.name,
				referenceNumber: booking.referenceNumber ?? 0,
				eventTitle: translation?.title ?? '',
				occurrenceDate: occurrence.date,
				refundAmount: params.refundAmount,
				currency: 'AMD',
				brandHost: booking.brandHost ?? undefined,
			});
		} catch (error) {
			this.logger.error('Failed to send guests not added email', error as Error);
		}
	}
}
