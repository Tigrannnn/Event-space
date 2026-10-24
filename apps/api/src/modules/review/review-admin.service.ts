import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import { MailService } from '@infra/mail/mail.service';
import { DEFAULT_LOCALE } from '@infra/mail/mail-strings';
import {
	AppErrorCode,
	EnvKey,
	getEventTranslation,
	REVIEW_CONFIG,
	type ModerateReviewData,
	type ReplyToReviewData,
	type ReviewStatus,
} from '@event-space/shared';
import { AppException, encodeKeysetCursor, keysetAfter, KEYSET_ORDER } from '@shared';
import { applyRatingDelta } from './review-rating';
import { eventUrl, siteUrlFor } from './review-urls';

const REVIEW_FOR_ADMIN = {
	user: { select: { id: true, name: true, email: true, image: true, locale: true } },
	event: { select: { id: true, translations: true } },
	booking: {
		select: {
			id: true,
			referenceNumber: true,
			brandHost: true,
			occurrence: { select: { date: true } },
		},
	},
} satisfies Prisma.ReviewInclude;

@Injectable()
export class ReviewAdminService {
	private readonly logger = new Logger(ReviewAdminService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly config: ConfigService,
		private readonly mailService: MailService,
	) {}

	async findAll(params: { status?: ReviewStatus; cursor?: string; limit?: number } = {}) {
		const limit = Math.min(Math.max(params.limit ?? REVIEW_CONFIG.PAGE_SIZE * 2, 1), 50);

		const rows = await this.prisma.review.findMany({
			where: {
				...(params.status ? { status: params.status } : {}),
				...(keysetAfter(params.cursor) ?? {}),
			},
			include: REVIEW_FOR_ADMIN,
			take: limit + 1,
			orderBy: KEYSET_ORDER,
		});

		const hasMore = rows.length > limit;
		const page = hasMore ? rows.slice(0, limit) : rows;
		const last = page[page.length - 1];

		return {
			data: page,
			nextCursor: hasMore && last ? encodeKeysetCursor(last) : null,
			hasMore,
		};
	}

	/** How many are waiting — the number on the tab in the sidebar. */
	pendingCount(): Promise<number> {
		return this.prisma.review.count({ where: { status: 'PENDING' } });
	}

	async moderate(adminId: string, id: string, data: ModerateReviewData) {
		const existing = await this.findOne(id);
		const status: ReviewStatus = data.action === 'PUBLISH' ? 'PUBLISHED' : 'REJECTED';

		return this.prisma.$transaction(async (tx) => {
			const review = await tx.review.update({
				where: { id },
				data: {
					status,
					moderatedAt: new Date(),
					moderatedByAdminId: adminId,
					// A reason belongs to a rejection; publishing clears whatever was there before.
					rejectReason: status === 'REJECTED' ? data.rejectReason?.trim() || null : null,
				},
				include: REVIEW_FOR_ADMIN,
			});

			await applyRatingDelta(tx, existing.eventId, existing, review);

			return review;
		});
	}

	async reply(id: string, data: ReplyToReviewData) {
		await this.findOne(id);
		const reply = data.reply?.trim() || null;

		const review = await this.prisma.review.update({
			where: { id },
			data: { adminReply: reply, adminReplyAt: reply ? new Date() : null },
			include: REVIEW_FOR_ADMIN,
		});

		if (reply) {
			await this.notifyAuthor(review, reply);
		}

		return review;
	}

	/**
	 * Tells the author their review has been answered.
	 *
	 * Without it the answer is written for nobody: the person has no reason to open the tour
	 * page again, and an answer to a complaint nobody reads is the same as no answer.
	 */
	private async notifyAuthor(
		review: Prisma.ReviewGetPayload<{ include: typeof REVIEW_FOR_ADMIN }>,
		reply: string,
	): Promise<void> {
		if (!review.user?.email) return;

		const locale = review.user.locale ?? DEFAULT_LOCALE;
		const siteUrl = siteUrlFor(
			review.booking?.brandHost,
			this.config.get<string>(EnvKey.FRONTEND_URL) ?? '',
		);

		try {
			await this.mailService.sendReviewReply({
				to: review.user.email,
				locale,
				userName: review.user.name,
				eventTitle: getEventTranslation({ translations: review.event?.translations ?? [] }, locale)
					.title,
				reviewText: review.text,
				reply,
				eventUrl: eventUrl(siteUrl, locale, review.eventId),
				brandHost: review.booking?.brandHost ?? undefined,
			});
		} catch (error) {
			this.logger.warn(`Could not tell the author about the reply to review ${review.id}`, error);
		}
	}

	async delete(id: string): Promise<void> {
		const existing = await this.findOne(id);

		await this.prisma.$transaction(async (tx) => {
			await tx.review.delete({ where: { id } });
			await applyRatingDelta(tx, existing.eventId, existing, null);
		});
	}

	private async findOne(id: string) {
		const review = await this.prisma.review.findUnique({ where: { id } });

		if (!review) {
			throw new AppException(AppErrorCode.REVIEW_NOT_FOUND, { id });
		}

		return review;
	}
}
