import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import { MailService } from '@infra/mail/mail.service';
import { UploadService } from '@infra/upload/upload.service';
import { DEFAULT_LOCALE } from '@infra/mail/mail-strings';
import {
	AppErrorCode,
	EnvKey,
	getEventTranslation,
	REVIEW_CONFIG,
	type ImportReviewData,
	type ModerateReviewData,
	type ReplyToReviewData,
	type ReviewStatus,
} from '@event-space/shared';
import { AppException, encodeKeysetCursor, keysetAfter, KEYSET_ORDER } from '@shared';
import { applyRatingDelta } from './review-rating';
import { eventUrl, siteUrlFor } from './review-urls';
import { REVIEW_IMAGES } from './review-images.select';

const REVIEW_FOR_ADMIN = {
	images: REVIEW_IMAGES,
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
		private readonly uploadService: UploadService,
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

	/**
	 * A review written on another site, put here by hand.
	 *
	 * Published at once: the person entering it is the company, who vouches for it by doing so. It
	 * has no booking and no account behind it, only the name it was written under and where.
	 */
	async createImported(
		adminId: string,
		data: ImportReviewData,
		files: Express.Multer.File[] = [],
	) {
		const event = await this.prisma.event.findUnique({
			where: { id: data.eventId },
			select: { id: true },
		});

		if (!event) {
			throw new AppException(AppErrorCode.EVENT_NOT_FOUND, { id: data.eventId });
		}

		const uploads = await this.uploadService.uploadImages(files);

		try {
			return await this.prisma.$transaction(async (tx) => {
				const created = await tx.review.create({
					data: {
						eventId: data.eventId,
						source: data.source,
						sourceName: data.source === 'OTHER' ? data.sourceName?.trim() || null : null,
						authorName: data.authorName.trim(),
						rating: data.rating,
						text: data.text?.trim() || null,
						status: 'PUBLISHED',
						moderatedAt: new Date(),
						moderatedByAdminId: adminId,
						createdAt: data.reviewedAt ?? undefined,
						images: {
							create: uploads.map((upload, order) => ({
								url: upload.url,
								publicId: upload.publicId,
								order,
							})),
						},
					},
					include: REVIEW_FOR_ADMIN,
				});

				await applyRatingDelta(tx, data.eventId, null, created);

				return created;
			});
		} catch (error) {
			await this.uploadService.deleteMultipleByPublicId(uploads.map((upload) => upload.publicId));
			throw error;
		}
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

		await this.uploadService.deleteMultipleByPublicId(existing.images.map((image) => image.publicId));
	}

	private async findOne(id: string) {
		const review = await this.prisma.review.findUnique({ where: { id }, include: { images: true } });

		if (!review) {
			throw new AppException(AppErrorCode.REVIEW_NOT_FOUND, { id });
		}

		return review;
	}
}
