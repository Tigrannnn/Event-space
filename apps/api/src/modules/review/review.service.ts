import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import {
	AppErrorCode,
	EnvKey,
	getEventTranslation,
	initialReviewStatus,
	REVIEW_CONFIG,
	reviewOpensAt,
	reviewWindow,
	type CreateReviewData,
	type MyReview,
	type UpdateReviewData,
} from '@event-space/shared';
import { AppException, encodeKeysetCursor, keysetAfter, KEYSET_ORDER } from '@shared';
import { MailService } from '@infra/mail/mail.service';
import { UploadService } from '@infra/upload/upload.service';
import { DEFAULT_LOCALE } from '@infra/mail/mail-strings';
import { applyRatingDelta } from './review-rating';
import { REVIEW_IMAGES } from './review-images.select';
import { reviewQueueUrl, siteUrlFor } from './review-urls';
import { reviewTokenSecret, signReviewToken, verifyReviewToken } from './review-token';
import { bookingLinkSecret, verifyBookingLinkToken } from '../booking/booking-link-token';

const REVIEW_AUTHOR = {
	user: { select: { id: true, name: true, image: true } },
	images: REVIEW_IMAGES,
} satisfies Prisma.ReviewInclude;

const BOOKING_FOR_REVIEW = {
	occurrence: {
		select: {
			date: true,
			status: true,
			event: {
				select: {
					id: true,
					duration: true,
					translations: true,
					organizer: { select: { email: true, name: true, locale: true } },
				},
			},
		},
	},
	review: { include: { images: REVIEW_IMAGES } },
	user: { select: { name: true } },
} satisfies Prisma.BookingInclude;

@Injectable()
export class ReviewService {
	private readonly logger = new Logger(ReviewService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly config: ConfigService,
		private readonly mailService: MailService,
		private readonly uploadService: UploadService,
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

			// The link to one's own booking opens the review form too: it is the same person.
			if (booking && verifyBookingLinkToken(bookingId, token, this.bookingLinkKey())) {
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

	private bookingLinkKey(): string {
		return bookingLinkSecret(
			this.config.get<string>(EnvKey.REVIEW_TOKEN_SECRET),
			this.config.getOrThrow<string>(EnvKey.JWT_ACCESS_SECRET),
		);
	}

	private tokenSecret(): string {
		return reviewTokenSecret(
			this.config.get<string>(EnvKey.REVIEW_TOKEN_SECRET),
			this.config.getOrThrow<string>(EnvKey.JWT_ACCESS_SECRET),
		);
	}

	/**
	 * The reviews under an event.
	 *
	 * Published ones for everybody, plus the visitor's own on top whatever state they are in —
	 * someone who has just written one should not have to scroll past ninety-nine strangers to
	 * find it, and a review still waiting to be read would otherwise look lost. Their own are
	 * kept out of the paged list so they do not appear twice.
	 */
	async findForEvent(
		eventId: string,
		params: { cursor?: string; limit?: number } = {},
		userId?: string,
	) {
		const limit = Math.min(Math.max(params.limit ?? REVIEW_CONFIG.PAGE_SIZE, 1), 50);

		const [rows, mine, reviewableBookingId] = await Promise.all([
			this.prisma.review.findMany({
				where: {
					eventId,
					status: 'PUBLISHED',
					AND: [
						// A review written elsewhere has no author here: `NOT userId = x` is unknown for
						// it, and unknown drops the row, so it is asked for by name.
						...(userId ? [{ OR: [{ userId: null }, { userId: { not: userId } }] }] : []),
						...(keysetAfter(params.cursor) ? [keysetAfter(params.cursor)!] : []),
					],
				},
				include: REVIEW_AUTHOR,
				take: limit + 1,
				orderBy: KEYSET_ORDER,
			}),
			// Only with the first page: it is the same answer every time, and the list below it
			// is the part that grows.
			userId && !params.cursor
				? this.prisma.review.findMany({
						where: { eventId, userId },
						include: REVIEW_AUTHOR,
						orderBy: KEYSET_ORDER,
					})
				: Promise.resolve([]),
			// Same first-page-only rule: it answers "may this visitor review the tour right now",
			// which the event page turns into a button.
			userId && !params.cursor
				? this.findReviewableBookingId(userId, eventId)
				: Promise.resolve(null),
		]);

		const hasMore = rows.length > limit;
		const page = hasMore ? rows.slice(0, limit) : rows;
		const last = page[page.length - 1];

		return {
			data: page,
			nextCursor: hasMore && last ? encodeKeysetCursor(last) : null,
			hasMore,
			mine,
			reviewableBookingId,
		};
	}

	/**
	 * A booking of this visitor on this event that can be reviewed now and has no review yet: the
	 * same test the booking card applies (`reviewWindow`), asked once for the whole event.
	 */
	private async findReviewableBookingId(userId: string, eventId: string): Promise<string | null> {
		const bookings = await this.prisma.booking.findMany({
			where: { userId, status: 'CONFIRMED', review: null, occurrence: { eventId } },
			select: {
				id: true,
				status: true,
				occurrence: {
					select: { date: true, status: true, event: { select: { duration: true } } },
				},
			},
			orderBy: { createdAt: 'desc' },
		});

		return bookings.find((booking) => reviewWindow(booking) === 'OPEN')?.id ?? null;
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
			review: booking.review,
			event: booking.occurrence?.event ?? null,
			occurrenceDate: booking.occurrence?.date ?? null,
		};
	}

	async create(
		userId: string,
		bookingId: string,
		data: CreateReviewData,
		files: Express.Multer.File[] = [],
	) {
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
		const status = initialReviewStatus(text, files.length);
		const uploads = await this.uploadService.uploadImages(files);

		let review;
		try {
			review = await this.prisma.$transaction(async (tx) => {
				const created = await tx.review.create({
					data: {
						bookingId,
						eventId,
						userId,
						rating: data.rating,
						text,
						status,
						images: {
							create: uploads.map((upload, order) => ({
								url: upload.url,
								publicId: upload.publicId,
								order,
							})),
						},
					},
					include: REVIEW_AUTHOR,
				});

				await applyRatingDelta(tx, eventId, null, created);

				return created;
			});
		} catch (error) {
			await this.uploadService.deleteMultipleByPublicId(uploads.map((upload) => upload.publicId));
			throw error;
		}

		if (review.status === 'PENDING') {
			await this.notifyPending(booking, review);
		}

		return review;
	}

	/**
	 * Tells the company a review is waiting for them.
	 *
	 * After the transaction and never inside it: a mail server having a bad minute must not
	 * undo someone's review. A failure is logged and nothing else — the queue in the admin
	 * panel is the source of truth, the letter is only a nudge towards it.
	 */
	private async notifyPending(
		booking: Prisma.BookingGetPayload<{ include: typeof BOOKING_FOR_REVIEW }>,
		review: { rating: number; text: string | null },
	): Promise<void> {
		const organizer = booking.occurrence?.event?.organizer;
		const translations = booking.occurrence?.event?.translations ?? [];

		if (!organizer?.email) return;

		const locale = organizer.locale ?? DEFAULT_LOCALE;
		const siteUrl = siteUrlFor(booking.brandHost, this.config.get<string>(EnvKey.FRONTEND_URL) ?? '');

		try {
			await this.mailService.sendReviewPendingNotice({
				to: organizer.email,
				locale,
				authorName: booking.user?.name ?? '—',
				eventTitle: getEventTranslation({ translations }, locale).title,
				rating: review.rating,
				text: review.text,
				queueUrl: reviewQueueUrl(siteUrl, locale),
				brandHost: booking.brandHost ?? undefined,
			});
		} catch (error) {
			this.logger.warn(`Could not tell the company about review on booking ${booking.id}`, error);
		}
	}

	async updateForBooking(
		userId: string,
		bookingId: string,
		data: UpdateReviewData,
		files: Express.Multer.File[] = [],
	) {
		const existing = await this.prisma.review.findUnique({
			where: { bookingId },
			include: { images: { orderBy: { order: 'asc' } } },
		});

		if (!existing || existing.userId !== userId) {
			throw new AppException(AppErrorCode.REVIEW_NOT_FOUND, { bookingId });
		}

		const reviewId = existing.id;

		const text = data.text?.trim() || null;

		// Without the list the photos stay as they are: an old client that knows nothing of them
		// must not wipe them by saving a corrected sentence.
		const kept =
			data.keepImageIds === undefined
				? existing.images
				: existing.images.filter((image) => data.keepImageIds?.includes(image.id));
		const removed = existing.images.filter((image) => !kept.includes(image));

		if (kept.length + files.length > REVIEW_CONFIG.MAX_IMAGES) {
			throw new AppException(AppErrorCode.VALIDATION_FAILED);
		}

		// An edited review is judged again from scratch: adding a sentence to a bare rating, or
		// a photo, turns it back into something a person has to look at.
		const status = initialReviewStatus(text, kept.length + files.length);
		const uploads = await this.uploadService.uploadImages(files);

		let updated;
		try {
			updated = await this.prisma.$transaction(async (tx) => {
				if (removed.length) {
					await tx.reviewImage.deleteMany({ where: { id: { in: removed.map((image) => image.id) } } });
				}

				const review = await tx.review.update({
					where: { id: reviewId },
					data: {
						rating: data.rating,
						text,
						status,
						moderatedAt: null,
						moderatedByAdminId: null,
						rejectReason: null,
						images: {
							create: uploads.map((upload, index) => ({
								url: upload.url,
								publicId: upload.publicId,
								order: kept.length + index,
							})),
						},
					},
					include: REVIEW_AUTHOR,
				});

				await applyRatingDelta(tx, existing.eventId, existing, review);

				return review;
			});
		} catch (error) {
			await this.uploadService.deleteMultipleByPublicId(uploads.map((upload) => upload.publicId));
			throw error;
		}

		await this.uploadService.deleteMultipleByPublicId(removed.map((image) => image.publicId));

		return updated;
	}

	async deleteForBooking(userId: string, bookingId: string): Promise<void> {
		const existing = await this.prisma.review.findUnique({
			where: { bookingId },
			include: { images: true },
		});

		if (!existing || existing.userId !== userId) {
			throw new AppException(AppErrorCode.REVIEW_NOT_FOUND, { bookingId });
		}

		await this.prisma.$transaction(async (tx) => {
			await tx.review.delete({ where: { id: existing.id } });
			await applyRatingDelta(tx, existing.eventId, existing, null);
		});

		await this.uploadService.deleteMultipleByPublicId(existing.images.map((image) => image.publicId));
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
