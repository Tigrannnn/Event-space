import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import {
	CreateEventData,
	EventImageFileItem,
	EventImageItem,
	EventStatus,
	EventStatusEnum,
	UpdateEventData,
	UserRoleType,
} from '@event-space/shared';
import { UploadService } from '@infra/upload/upload.service';
import { PrismaService } from '@infra/prisma/prisma.service';
import { EventImage, Prisma } from '@prisma/client';
import { BookingService } from '../booking/booking.service';
import { MailService } from '@infra/mail/mail.service';
import {
	assertCanModify,
	buildNewImageRows,
	eventMatchesGuestCapacity,
	findRemovedImages,
	sortByOrder,
	validateExistingImageRefs,
	validateStatusTransition,
} from './event.utils';
import { OccurrenceService } from '@modules/occurrence/occurrence.service';
import { EventOccurrenceStatusEnum } from '@event-space/shared';

@Injectable()
export class EventService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly uploadService: UploadService,
		private readonly bookingService: BookingService,
		private readonly mailService: MailService,
		private readonly occurrenceService: OccurrenceService,
	) {}

	private readonly organizerInclude = {
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
		},
	};

	private readonly imagesInclude = {
		orderBy: { order: 'asc' as const },
	};

	private readonly eventInclude = {
		organizer: this.organizerInclude,
		images: this.imagesInclude,
		cancellationRules: true,
		translations: true,
		category: {
			include: {
				translations: true,
			},
		},
		occurrences: { orderBy: { date: 'asc' as const } },
	};

	async findAll(
		cursor?: string,
		limit: number = 8,
		search?: string,
		startDate?: string,
		endDate?: string,
		categorySlug?: string,
		minPrice?: number,
		maxPrice?: number,
		guests?: number,
	) {
		const [cursorDate, cursorId] = cursor ? cursor.split('_') : [null, null];

		const searchFilter = search
			? {
					OR: [
						{
							translations: {
								some: {
									OR: [
										{ title: { contains: search, mode: 'insensitive' as const } },
										{ description: { contains: search, mode: 'insensitive' as const } },
										{ location: { contains: search, mode: 'insensitive' as const } },
									],
								},
							},
						},
						{
							category: {
								translations: {
									some: {
										name: { contains: search, mode: 'insensitive' as const },
									},
								},
							},
						},
					],
				}
			: {};

		const categoryFilter = categorySlug
			? {
					category: {
						slug: categorySlug,
					},
				}
			: {};

		const priceFilter =
			minPrice !== undefined || maxPrice !== undefined
				? {
						price: {
							...(minPrice !== undefined ? { gte: minPrice } : {}),
							...(maxPrice !== undefined ? { lte: maxPrice } : {}),
						},
					}
				: {};

		const occurrenceDateFilter: Prisma.DateTimeFilter =
			startDate || endDate
				? {
						...(startDate && { gte: new Date(startDate) }),
						...(endDate && { lte: new Date(endDate) }),
					}
				: { gt: new Date() };

		const statusFilter = {
			status: EventStatusEnum.enum.PUBLISHED,
			occurrences: {
				some: { date: occurrenceDateFilter, status: EventOccurrenceStatusEnum.enum.ACTIVE },
			},
		};

		const filters = [statusFilter, searchFilter, categoryFilter, priceFilter].filter(
			(f) => Object.keys(f).length > 0,
		);

		const where: Prisma.EventWhereInput = {
			AND: filters.length > 0 ? filters : undefined,
		};

		// Safely inject cursor pagination directly into AND condition only when both cursor values exist
		if (cursorDate && cursorId) {
			if (!where.AND) {
				where.AND = [];
			} else if (!Array.isArray(where.AND)) {
				where.AND = [where.AND];
			}
			(where.AND as Prisma.EventWhereInput[]).push({
				occurrences: {
					some: {
						OR: [
							{ date: { gt: new Date(cursorDate) } },
							{ date: { equals: new Date(cursorDate) }, eventId: { gt: cursorId } },
						],
					},
				},
			});
		}

		const events = await this.prisma.event.findMany({
			where,
			take: limit + 1,
			orderBy: [{ id: 'asc' }],
			include: this.eventInclude,
		});

		const filteredByGuestCapacity =
			guests && guests > 0
				? events.filter((event) => eventMatchesGuestCapacity(event, guests))
				: events;

		const hasMore = filteredByGuestCapacity.length > limit;
		const data = hasMore ? filteredByGuestCapacity.slice(0, limit) : filteredByGuestCapacity;

		const lastEvent = data[data.length - 1];
		// Cursor is based on the earliest future occurrence date for the last event
		const earliestOccurrence = (lastEvent as any)?.occurrences?.find(
			(o: any) => new Date(o.date) > new Date(),
		);
		const nextCursor =
			hasMore && lastEvent ? `${earliestOccurrence?.date.toISOString()}_${lastEvent.id}` : null;

		return { data, nextCursor, hasMore };
	}

	async findOne(id: string) {
		const event = await this.prisma.event.findUnique({
			where: { id },
			include: this.eventInclude,
		});
		if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
		if (event.status !== 'PUBLISHED') throw new NotFoundException(`Event with ID ${id} not found`);
		return {
			...event,
			occurrences: event.occurrences.filter((o) => o.status === 'ACTIVE'),
		};
	}

	async findOneAny(id: string) {
		const event = await this.prisma.event.findUnique({
			where: { id },
			include: this.eventInclude,
		});
		if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
		return event;
	}

	async create(
		userId: string,
		eventData: CreateEventData,
		imageItems: EventImageFileItem[] = [],
		files: Express.Multer.File[] = [],
	) {
		const sortedItems = sortByOrder(imageItems);
		const uploads = await this.uploadNewFiles(files);
		const { cancellationRules, organizer, translations, occurrences, ...pureEventData } = eventData;

		// Validate that no occurrence is in the past
		for (const occurrence of occurrences ?? []) {
			if (new Date(occurrence.date) < new Date()) {
				throw new BadRequestException('Cannot create an occurrence in the past');
			}
		}

		try {
			return await this.prisma.$transaction(async (tx) => {
				const created = await tx.event.create({
					data: {
						...pureEventData,
						userId,
						cancellationRules:
							cancellationRules && cancellationRules.length > 0
								? { create: cancellationRules }
								: undefined,
						translations: translations && translations.length > 0 ? { create: translations } : undefined,
					},
				});

				const rows = buildNewImageRows(created.id, sortedItems, uploads);
				if (rows.length) {
					await tx.eventImage.createMany({ data: rows });
				}

				// Create occurrences for the event
				if (occurrences && occurrences.length > 0) {
					await tx.eventOccurrence.createMany({
						data: occurrences.map((o) => ({
							eventId: created.id,
							date: o.date,
							maxParticipants: o.maxParticipants,
						})),
					});
				}

				return tx.event.findUniqueOrThrow({
					where: { id: created.id },
					include: this.eventInclude,
				});
			});
		} catch (error) {
			await this.uploadService.deleteMultipleByPublicId(uploads.map((u) => u.publicId));
			throw error;
		}
	}

	async update(
		id: string,
		userId: string,
		role: UserRoleType,
		eventData: UpdateEventData,
		imageItems: EventImageItem[],
		files: Express.Multer.File[] = [],
	) {
		const event = await this.findOneAny(id);
		assertCanModify(event.userId, userId, role);

		const sortedItems = sortByOrder(imageItems);
		const existingImages = event.images ?? [];
		validateExistingImageRefs(sortedItems, existingImages);

		const uploads = await this.uploadNewFiles(files);
		const removedImages = findRemovedImages(existingImages, sortedItems);
		const { cancellationRules, translations, cancellationReason, occurrences, ...pureEventData } =
			eventData;

		// Validate status transition if status is changing
		if (pureEventData.status && pureEventData.status !== event.status) {
			validateStatusTransition(event.status, pureEventData.status);
		}

		const isCancelling = pureEventData.status === 'CANCELLED' && event.status !== 'CANCELLED';

		// Validate occurrence dates if provided
		for (const occurrence of occurrences ?? []) {
			if (new Date(occurrence.date) < new Date()) {
				throw new BadRequestException('Cannot create an occurrence in the past');
			}
		}

		try {
			const updated = await this.prisma.$transaction(async (tx) => {
				const updateData = { ...pureEventData } as Prisma.EventUpdateInput;

				if (cancellationRules !== undefined) {
					updateData.cancellationRules = {
						deleteMany: {},
						create: cancellationRules,
					};
				}

				if (translations !== undefined) {
					updateData.translations = {
						deleteMany: {},
						create: translations,
					};
				}

				if (
					Object.keys(pureEventData).length > 0 ||
					cancellationRules !== undefined ||
					translations !== undefined
				) {
					await tx.event.update({ where: { id }, data: updateData });
				}

				// If we're cancelling the event, update all confirmed bookings to cancelled/refunded
				// If we're cancelling the event, any booking/count adjustments are handled by booking service

				if (removedImages.length) {
					await tx.eventImage.deleteMany({
						where: { id: { in: removedImages.map((img) => img.id) } },
					});
				}

				let uploadIndex = 0;
				for (const item of sortedItems) {
					if (item.kind === 'existing') {
						await tx.eventImage.update({
							where: { id: item.id },
							data: { order: item.order },
						});
						continue;
					}

					const upload = uploads[uploadIndex++];
					await tx.eventImage.create({
						data: {
							eventId: id,
							url: upload.url,
							publicId: upload.publicId,
							order: item.order,
						},
					});
				}

				// If occurrences were provided, replace them (delete all + recreate)
				if (occurrences !== undefined) {
					await this.occurrenceService.syncForEvent(id, event.occurrences, occurrences, tx);
				}

				return tx.event.findUniqueOrThrow({
					where: { id },
					include: {
						...this.eventInclude,
						occurrences: {
							include: { bookings: { include: { user: true } } },
							orderBy: { date: 'asc' as const },
						},
					},
				});
			});

			await this.uploadService.deleteMultipleByPublicId(removedImages.map((img) => img.publicId));

			if (isCancelling) {
				// Cancel all bookings and process refunds
				await this.bookingService.cancelEventBookings(id);

				// Get event title from translations (fallback to first available)
				let eventTitle = 'Event';
				if (event.translations.length > 0) {
					eventTitle = event.translations[0].title;
				}

				// Gather all bookings from occurrences included in updated
				const occurrencesWithBookings = updated.occurrences ?? [];
				const allBookings = occurrencesWithBookings.flatMap((o) =>
					(o.bookings ?? []).map((b) => ({ booking: b, occurrenceDate: o.date })),
				);

				for (const { booking, occurrenceDate } of allBookings) {
					if (booking.user && booking.user.email) {
						// TODO: remove AMD hardcoding
						const refundAmount = `${Number(booking.amount).toFixed(2)} AMD`;
						await this.mailService.sendEventCancelledEmail(
							booking.user.email,
							booking.user.name || 'User',
							eventTitle,
							occurrenceDate,
							refundAmount,
							cancellationReason,
						);
					}
				}
			}

			// Note: reschedule notifications are not implemented here — occurrences contain dates now

			return updated;
		} catch (error) {
			await this.uploadService.deleteMultipleByPublicId(uploads.map((u) => u.publicId));
			throw error;
		}
	}

	async delete(id: string, userId: string, role: UserRoleType) {
		const event = await this.findOneAny(id);
		assertCanModify(event.userId, userId, role);

		const activeBookingsCount = await this.prisma.booking.count({
			where: { occurrence: { eventId: id }, status: { not: 'CANCELLED' } },
		});
		if (activeBookingsCount > 0) {
			throw new ConflictException({
				code: 'EVENT_HAS_BOOKINGS',
				message: 'Event has active bookings, cancel it instead of deleting',
			});
		}

		const publicIds = (event.images ?? []).map((img) => img.publicId);
		await this.prisma.event.delete({ where: { id } });
		await this.uploadService.deleteMultipleByPublicId(publicIds);
		return event;
	}

	private async uploadNewFiles(files: Express.Multer.File[]) {
		if (!files.length) return [];
		return this.uploadService.uploadImages(files);
	}
}
