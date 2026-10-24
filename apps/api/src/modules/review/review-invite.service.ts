import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import { MailService } from '@infra/mail/mail.service';
import { DEFAULT_LOCALE } from '@infra/mail/mail-strings';
import { EnvKey, getEventTranslation, reviewOpensAt, REVIEW_CONFIG } from '@event-space/shared';
import { ReviewService } from './review.service';
import { reviewFormUrl, siteUrlFor } from './review-urls';

const BATCH_SIZE = 100;
const MAIL_BATCH_SIZE = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

const INVITE_INCLUDE = {
	user: true,
	review: { select: { id: true } },
	occurrence: {
		include: { event: { include: { translations: true } } },
	},
} satisfies Prisma.BookingInclude;

type InviteBooking = Prisma.BookingGetPayload<{ include: typeof INVITE_INCLUDE }>;

@Injectable()
export class ReviewInviteService {
	private readonly logger = new Logger(ReviewInviteService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly mailService: MailService,
		private readonly reviewService: ReviewService,
		private readonly config: ConfigService,
	) {}

	/**
	 * Invites the guests of tours that have just ended to rate them.
	 *
	 * Hourly, and one invitation per booking ever: `reviewInviteSentAt` is the mark. No quiet
	 * hours — the trigger is the tour the person has just come back from, so a tour ending at
	 * eleven finds them awake with the phone in their hand, while a letter held until morning
	 * lands in the coldest possible moment.
	 */
	@Cron(CronExpression.EVERY_HOUR)
	async sendInvites(): Promise<void> {
		const now = Date.now();

		// The database cannot work out "the tour has ended" on its own — that is the start plus
		// the event's own duration — so the window is narrowed here and settled in code below.
		const candidates = await this.prisma.booking.findMany({
			where: {
				status: 'CONFIRMED',
				reviewInviteSentAt: null,
				user: { email: { not: null } },
				occurrence: {
					status: 'ACTIVE',
					date: {
						lte: new Date(now),
						gte: new Date(now - REVIEW_CONFIG.WINDOW_DAYS * DAY_MS),
					},
				},
			},
			include: INVITE_INCLUDE,
			orderBy: { createdAt: 'asc' },
			take: BATCH_SIZE,
		});

		const due = candidates.filter(
			(booking) =>
				!booking.review &&
				booking.occurrence !== null &&
				now >= reviewOpensAt(booking.occurrence.date, booking.occurrence.event?.duration),
		);

		if (due.length === 0) return;

		this.logger.log(`Sending ${due.length} review invites`);

		for (let index = 0; index < due.length; index += MAIL_BATCH_SIZE) {
			await Promise.all(due.slice(index, index + MAIL_BATCH_SIZE).map((b) => this.invite(b)));
		}
	}

	private async invite(booking: InviteBooking): Promise<void> {
		const email = booking.user.email;
		const event = booking.occurrence?.event;

		if (!email || !event) return;

		const locale = booking.user.locale ?? DEFAULT_LOCALE;
		const token = this.reviewService.buildReviewToken(booking.id);
		const base = siteUrlFor(booking.brandHost, this.config.get<string>(EnvKey.FRONTEND_URL) ?? '');

		const sent = await this.mailService.sendReviewInvite({
			to: email,
			locale,
			userName: booking.user.name,
			eventTitle: getEventTranslation({ translations: event.translations }, locale).title,
			reviewUrl: reviewFormUrl(base, locale, booking.id, token),
			brandHost: booking.brandHost ?? undefined,
		});

		// Marked either way: a bounced address will bounce again next hour, and nobody wants
		// the same invitation once an hour for sixty days.
		await this.prisma.booking.update({
			where: { id: booking.id },
			data: { reviewInviteSentAt: new Date() },
		});

		if (!sent) {
			this.logger.warn(`Review invite for booking ${booking.id} could not be delivered`);
		}
	}
}
