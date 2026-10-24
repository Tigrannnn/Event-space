import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import {
	AppErrorCode,
	REVIEW_CONFIG,
	type ModerateReviewData,
	type ReplyToReviewData,
	type ReviewStatus,
} from '@event-space/shared';
import { AppException, encodeKeysetCursor, keysetAfter, KEYSET_ORDER } from '@shared';
import { applyRatingDelta } from './review-rating';

const REVIEW_FOR_ADMIN = {
	user: { select: { id: true, name: true, email: true, image: true } },
	event: { select: { id: true, translations: true } },
	booking: { select: { id: true, referenceNumber: true, occurrence: { select: { date: true } } } },
} satisfies Prisma.ReviewInclude;

@Injectable()
export class ReviewAdminService {
	constructor(private readonly prisma: PrismaService) {}

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

		return this.prisma.review.update({
			where: { id },
			data: { adminReply: reply, adminReplyAt: reply ? new Date() : null },
			include: REVIEW_FOR_ADMIN,
		});
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
