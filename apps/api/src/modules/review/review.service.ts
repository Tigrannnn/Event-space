import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import {
	AppErrorCode,
	canEditReview,
	EnvKey,
	initialReviewStatus,
	REVIEW_CONFIG,
	reviewOpensAt,
	reviewWindow,
	type CreateReviewData,
	type MyReview,
	type UpdateReviewData,
} from '@event-space/shared';
import { AppException, encodeKeysetCursor, keysetAfter, KEYSET_ORDER } from '@shared';
import { applyRatingDelta } from './review-rating';
import { reviewTokenSecret, signReviewToken, verifyReviewToken } from './review-token';

const BOOKING_FOR_REVIEW = {
	occurrence: {
		select: {
			date: true,
			status: true,
			event: { select: { id: true, duration: true, translations: true } },
		},
	},
	review: true,
} satisfies Prisma.BookingInclude;

@Injectable()
export class ReviewService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly config: ConfigService,
	) {}

	/**
	 * Who is acting on this booking: the signed-in owner, or whoever holds the link we emailed.
	 *
	 * The link is the only way in for a guest an admin booked by hand — they have no password
	 * and never will. It is checked against the booking in the path, so one link opens one
	 * booking and nothing else.
	 */
	async resolveActor(bookingId: string, userId?: string, token?: string): Promise<string> {
		if (token) {
			const booking = await this.prisma.booking.findUnique({
				where: { id: bookingId },
				select: { userId: true },
			});

			if (booking && verifyReviewToken(bookingId, token, this.tokenSecret())) {
				return booking.userId;
			}
		}

		if (!userId) {
			throw new AppException(AppErrorCode.UNAUTHORIZED);
		}

		return userId;
	}

	/** A link that outlives the review window by a day, so the last day of it still works. */
	buildReviewToken(bookingId: string, now: number = Date.now()): string {
		const lifetimeMs = (REVIEW_CONFIG.WINDOW_DAYS + 1) * 24 * 60 * 60 * 1000;

		return signReviewToken(bookingId, now + lifetimeMs, this.tokenSecret());
	}

	private tokenSecret(): string {
		return reviewTokenSecret(
			this.config.get<string>(EnvKey.REVIEW_TOKEN_SECRET),
			this.config.getOrThrow<string>(EnvKey.JWT_ACCESS_SECRET),
		);
	}

	/** The reviews under an event: published ones only, newest first. */
	async findForEvent(eventId: string, params: { cursor?: string; limit?: number } = {}) {
		const limit = Math.min(Math.max(params.limit ?? REVIEW_CONFIG.PAGE_SIZE, 1), 50);

		const rows = await this.prisma.review.findMany({
			where: { eventId, status: 'PUBLISHED', ...(keysetAfter(params.cursor) ?? {}) },
			include: { user: { select: { id: true, name: true, image: true } } },
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

	/** What this booking's card should draw: the review, or the reason there is no button. */
	async findMine(userId: string, bookingId: string): Promise<MyReview> {
		const booking = await this.loadBooking(userId, bookingId);
		const now = Date.now();

		return {
			window: reviewWindow(booking, now),
			opensAt: booking.occurrence
				? new Date(reviewOpensAt(booking.occurrence.date, booking.occurrence.event?.duration))
				: null,
			canEdit: booking.review ? canEditReview(booking.review.createdAt, now) : false,
			review: booking.review,
			event: booking.occurrence?.event ?? null,
			occurrenceDate: booking.occurrence?.date ?? null,
		};
	}

	async create(userId: string, bookingId: string, data: CreateReviewData) {
		const booking = await this.loadBooking(userId, bookingId);

		this.assertWindowOpen(booking);

		if (booking.review) {
			throw new AppException(AppErrorCode.REVIEW_ALREADY_EXISTS);
		}

		const eventId = booking.occurrence?.event?.id;
		if (!eventId) {
			throw new AppException(AppErrorCode.REVIEW_NOT_ELIGIBLE);
		}

		const text = data.text?.trim() || null;
		const status = initialReviewStatus(text);

		return this.prisma.$transaction(async (tx) => {
			const review = await tx.review.create({
				data: { bookingId, eventId, userId, rating: data.rating, text, status },
				include: { user: { select: { id: true, name: true, image: true } } },
			});

			await applyRatingDelta(tx, eventId, null, review);

			return review;
		});
	}

	async updateForBooking(userId: string, bookingId: string, data: UpdateReviewData) {
		const existing = await this.prisma.review.findUnique({ where: { bookingId } });

		if (!existing || existing.userId !== userId) {
			throw new AppException(AppErrorCode.REVIEW_NOT_FOUND, { bookingId });
		}

		const reviewId = existing.id;

		if (!canEditReview(existing.createdAt)) {
			throw new AppException(AppErrorCode.REVIEW_EDIT_WINDOW_CLOSED);
		}

		const text = data.text?.trim() || null;
		// An edited review is judged again from scratch: adding a sentence to a bare rating
		// turns it back into something a person has to read.
		const status = initialReviewStatus(text);

		return this.prisma.$transaction(async (tx) => {
			const review = await tx.review.update({
				where: { id: reviewId },
				data: {
					rating: data.rating,
					text,
					status,
					moderatedAt: null,
					moderatedByAdminId: null,
					rejectReason: null,
				},
				include: { user: { select: { id: true, name: true, image: true } } },
			});

			await applyRatingDelta(tx, existing.eventId, existing, review);

			return review;
		});
	}

	private assertWindowOpen(booking: Parameters<typeof reviewWindow>[0]): void {
		switch (reviewWindow(booking)) {
			case 'OPEN':
				return;
			case 'TOO_EARLY':
				throw new AppException(AppErrorCode.REVIEW_TOO_EARLY);
			case 'CLOSED':
				throw new AppException(AppErrorCode.REVIEW_WINDOW_CLOSED);
			case 'NOT_ELIGIBLE':
				throw new AppException(AppErrorCode.REVIEW_NOT_ELIGIBLE);
		}
	}

	private async loadBooking(userId: string, bookingId: string) {
		const booking = await this.prisma.booking.findUnique({
			where: { id: bookingId },
			include: BOOKING_FOR_REVIEW,
		});

		if (!booking || booking.userId !== userId) {
			throw new AppException(AppErrorCode.BOOKING_NOT_FOUND, { id: bookingId });
		}

		return booking;
	}
}
