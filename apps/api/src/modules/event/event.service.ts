import {
	BadRequestException,
	ForbiddenException,
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

@Injectable()
export class EventService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly uploadService: UploadService,
		private readonly bookingService: BookingService,
		private readonly mailService: MailService,
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
	};

	async findAll(cursor?: string, limit: number = 8, search?: string) {
		const [cursorDate, cursorId] = cursor ? cursor.split('_') : [null, null];

		const searchFilter = search
			? {
					translations: {
						some: {
							OR: [
								{ title: { contains: search, mode: 'insensitive' as const } },
								{ description: { contains: search, mode: 'insensitive' as const } },
								{ category: { contains: search, mode: 'insensitive' as const } },
								{ location: { contains: search, mode: 'insensitive' as const } },
							],
						},
					},
				}
			: {};

		const cursorFilter =
			cursorDate && cursorId
				? {
						OR: [
							{ date: { gt: new Date(cursorDate) } },
							{
								date: { equals: new Date(cursorDate) },
								id: { gt: cursorId },
							},
						],
					}
				: {};

		const statusFilter = { status: EventStatusEnum.enum.PUBLISHED, date: { gt: new Date() } };

		const filters = [statusFilter, searchFilter, cursorFilter].filter(
			(f) => Object.keys(f).length > 0,
		);
		const where = filters.length > 0 ? { AND: filters } : {};

		const events = await this.prisma.event.findMany({
			where,
			take: limit + 1,
			orderBy: [{ date: 'asc' }, { id: 'asc' }],
			include: this.eventInclude,
		});

		const hasMore = events.length > limit;
		const data = hasMore ? events.slice(0, limit) : events;

		const lastEvent = data[data.length - 1];
		const nextCursor =
			hasMore && lastEvent ? `${lastEvent.date.toISOString()}_${lastEvent.id}` : null;

		return { data, nextCursor, hasMore };
	}

	async findOne(id: string) {
		const event = await this.prisma.event.findUnique({
			where: { id },
			include: this.eventInclude,
		});

		if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
		if (event.status !== 'PUBLISHED') throw new NotFoundException(`Event with ID ${id} not found`);
		// Exclude difficulty from public response
		const { difficulty, ...eventWithoutDifficulty } = event;
		return eventWithoutDifficulty;
	}

	private async findOneAny(id: string) {
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
		const sortedItems = this.sortByOrder(imageItems);
		const uploads = await this.uploadNewFiles(files);
		const { cancellationRules, organizer, translations, ...pureEventData } = eventData;

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

				const rows = this.buildNewImageRows(created.id, sortedItems, uploads);
				if (rows.length) {
					await tx.eventImage.createMany({ data: rows });
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

	private validateStatusTransition(oldStatus: EventStatus, newStatus: EventStatus): void {
		if (oldStatus === newStatus) return;

		const allowedTransitions: Record<EventStatus, EventStatus[]> = {
			DRAFT: ['PUBLISHED', 'CANCELLED'],
			PUBLISHED: ['CANCELLED'],
			CANCELLED: [],
		};

		if (!allowedTransitions[oldStatus].includes(newStatus)) {
			throw new BadRequestException(`Cannot change status from ${oldStatus} to ${newStatus}`);
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
		this.assertCanModify(event.userId, userId, role);

		const sortedItems = this.sortByOrder(imageItems);
		const existingImages = event.images ?? [];
		this.validateExistingImageRefs(sortedItems, existingImages);

		const uploads = await this.uploadNewFiles(files);
		const removedImages = this.findRemovedImages(existingImages, sortedItems);
		const { cancellationRules, translations, cancellationReason, ...pureEventData } = eventData;

		// Validate status transition if status is changing
		if (pureEventData.status && pureEventData.status !== event.status) {
			this.validateStatusTransition(event.status, pureEventData.status);
		}

		const isCancelling = pureEventData.status === 'CANCELLED' && event.status !== 'CANCELLED';
		const isDateChanging = pureEventData.date && new Date(pureEventData.date).getTime() !== new Date(event.date).getTime();

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

				if (Object.keys(pureEventData).length > 0 || cancellationRules !== undefined || translations !== undefined) {
					await tx.event.update({ where: { id }, data: updateData });
				}

				// If we're cancelling the event, update all confirmed bookings to cancelled/refunded
				if (isCancelling) {
					// Set current participants to 0
					await tx.event.update({
						where: { id },
						data: { currentParticipants: 0 },
					});
				}

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

				return tx.event.findUniqueOrThrow({
					where: { id },
					include: { ...this.eventInclude, bookings: { include: { user: true } } },
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

				// Send emails to all affected users
				if (updated.bookings) {
					for (const booking of updated.bookings) {
						if (booking.user && booking.user.email) {
							// TODO: remove AMD hardcoding
							const refundAmount = `${Number(booking.amount).toFixed(2)} AMD`;
							await this.mailService.sendEventCancelledEmail(
								booking.user.email,
								booking.user.name || 'User',
								eventTitle,
								event.date,
								refundAmount,
								cancellationReason,
							);
						}
					}
				}
			}

			// Send email notifications if date/time changed and there are bookings
			if (isDateChanging && updated.bookings && updated.bookings.length > 0) {
				let eventTitle = 'Event';
				if (event.translations.length > 0) {
					eventTitle = event.translations[0].title;
				}
				
				// TODO: create sendEventRescheduledEmail method in MailService
				// For now, we'll just log (you can implement the email template later)
				console.log(`Event ${eventTitle} (ID: ${id}) rescheduled from ${event.date} to ${pureEventData.date}. Notifying ${updated.bookings.length} users.`);
			}

			return updated;
		} catch (error) {
			await this.uploadService.deleteMultipleByPublicId(uploads.map((u) => u.publicId));
			throw error;
		}
	}

	async delete(id: string, userId: string, role: UserRoleType) {
		const event = await this.findOneAny(id);
		this.assertCanModify(event.userId, userId, role);

		const publicIds = (event.images ?? []).map((img) => img.publicId);

		await this.prisma.event.delete({ where: { id } });
		await this.uploadService.deleteMultipleByPublicId(publicIds);

		return event;
	}

	private sortByOrder<T extends { order: number }>(items: T[]): T[] {
		return [...items].sort((a, b) => a.order - b.order);
	}

	private async uploadNewFiles(files: Express.Multer.File[]) {
		if (!files.length) return [];
		return this.uploadService.uploadImages(files);
	}

	private buildNewImageRows(
		eventId: string,
		imageItems: EventImageFileItem[],
		uploads: Awaited<ReturnType<UploadService['uploadImages']>>,
	): Prisma.EventImageCreateManyInput[] {
		return imageItems.map((item, index) => ({
			eventId,
			url: uploads[index].url,
			publicId: uploads[index].publicId,
			order: item.order,
		}));
	}

	private validateExistingImageRefs(imageItems: EventImageItem[], existingImages: EventImage[]) {
		const existingIds = new Set(existingImages.map((img) => img.id));
		const payloadExistingIds = imageItems
			.filter((item) => item.kind === 'existing')
			.map((item) => item.id);

		for (const id of payloadExistingIds) {
			if (!existingIds.has(id)) {
				throw new BadRequestException(`Event image ${id} does not belong to this event`);
			}
		}

		const unique = new Set(payloadExistingIds);
		if (unique.size !== payloadExistingIds.length) {
			throw new BadRequestException('Duplicate existing image ids in payload');
		}
	}

	private findRemovedImages(existingImages: EventImage[], imageItems: EventImageItem[]) {
		const keptIds = new Set(
			imageItems.filter((item) => item.kind === 'existing').map((item) => item.id),
		);
		return existingImages.filter((img) => !keptIds.has(img.id));
	}

	private assertCanModify(ownerId: string, userId: string, role: UserRoleType) {
		if (ownerId !== userId && role !== 'ADMIN') {
			throw new ForbiddenException('You do not have permission to modify this event');
		}
	}
}
