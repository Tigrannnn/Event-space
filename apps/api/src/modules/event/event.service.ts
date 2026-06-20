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

@Injectable()
export class EventService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly uploadService: UploadService,
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
	};

	async findAll(cursor?: string, limit: number = 8, search?: string) {
		const [cursorDate, cursorId] = cursor ? cursor.split('_') : [null, null];

		const searchFilter = search
			? {
					OR: [
						{ title: { contains: search, mode: 'insensitive' as const } },
						{ description: { contains: search, mode: 'insensitive' as const } },
						{ category: { contains: search, mode: 'insensitive' as const } },
						{ location: { contains: search, mode: 'insensitive' as const } },
					],
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
		const { cancellationRules, organizer, ...pureEventData } = eventData;

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
		const { cancellationRules, ...pureEventData } = eventData;

		try {
			const updated = await this.prisma.$transaction(async (tx) => {
				const updateData = { ...pureEventData } as Prisma.EventUpdateInput;

				if (cancellationRules !== undefined) {
					updateData.cancellationRules = {
						deleteMany: {},
						create: cancellationRules,
					};
				}

				if (Object.keys(pureEventData).length > 0 || cancellationRules !== undefined) {
					await tx.event.update({ where: { id }, data: updateData });
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
					include: this.eventInclude,
				});
			});

			await this.uploadService.deleteMultipleByPublicId(removedImages.map((img) => img.publicId));

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
