import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import { UploadService, type CloudinaryUploadResult } from '@infra/upload/upload.service';
import { AppException } from '@shared';
import {
	AppErrorCode,
	BANNER_LIMITS,
	bannerTargetIssue,
	type CreateBannerData,
	type CreateBannerTranslation,
	type UpdateBannerData,
} from '@event-space/shared';
import { BANNER_INCLUDE, type BannerWithTargets } from './banner.constants';
import { BannerService } from './banner.service';

function toTranslationRow(translation: CreateBannerTranslation) {
	return {
		locale: translation.locale,
		title: translation.title,
		subtitle: translation.subtitle ?? null,
	};
}

export interface BannerImageFiles {
	image?: Express.Multer.File;
	imageMobile?: Express.Multer.File;
}

@Injectable()
export class BannerAdminService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly uploadService: UploadService,
		private readonly bannerService: BannerService,
	) {}

	findAll(): Promise<BannerWithTargets[]> {
		return this.prisma.banner.findMany({
			include: BANNER_INCLUDE,
			orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
		});
	}

	async findOne(id: string): Promise<BannerWithTargets> {
		const banner = await this.prisma.banner.findUnique({ where: { id }, include: BANNER_INCLUDE });

		if (!banner) {
			throw new AppException(AppErrorCode.BANNER_NOT_FOUND, { id });
		}

		return banner;
	}

	async create(data: CreateBannerData, files: BannerImageFiles): Promise<BannerWithTargets> {
		if (!files.image) {
			throw new AppException(AppErrorCode.BANNER_IMAGE_REQUIRED);
		}

		await this.assertTargetExists(data.targetType, data);

		if (data.status === 'ACTIVE') {
			await this.assertActiveSlotFree();
		}

		const { translations, ...fields } = data;

		const image = await this.uploadService.uploadImage(files.image);
		let imageMobile: CloudinaryUploadResult | null = null;

		try {
			if (files.imageMobile) {
				imageMobile = await this.uploadService.uploadImage(files.imageMobile);
			}

			const banner = await this.prisma.banner.create({
				data: {
					imageUrl: image.url,
					imagePublicId: image.publicId,
					imageMobileUrl: imageMobile?.url ?? null,
					imageMobilePublicId: imageMobile?.publicId ?? null,
					status: fields.status,
					startsAt: fields.startsAt ?? null,
					endsAt: fields.endsAt ?? null,
					targetType: fields.targetType,
					eventId: fields.targetType === 'EVENT' ? (fields.eventId ?? null) : null,
					categoryId: fields.targetType === 'CATEGORY' ? (fields.categoryId ?? null) : null,
					url: fields.targetType === 'URL' ? (fields.url ?? null) : null,
					textAlign: fields.textAlign,
					theme: fields.theme,
					sortOrder: await this.nextSortOrder(),
					translations: { create: translations.map(toTranslationRow) },
				},
				include: BANNER_INCLUDE,
			});

			await this.bannerService.invalidateCache();

			return banner;
		} catch (error) {
			await this.uploadService.deleteMultipleByPublicId(
				[image.publicId, imageMobile?.publicId].filter((publicId): publicId is string =>
					Boolean(publicId),
				),
			);
			throw error;
		}
	}

	async update(
		id: string,
		data: UpdateBannerData,
		files: BannerImageFiles,
	): Promise<BannerWithTargets> {
		const existing = await this.findOne(id);

		const { translations, removeMobileImage, ...fields } = data;

		const targetType = fields.targetType ?? existing.targetType;
		await this.assertTargetExists(targetType, {
			eventId: fields.eventId !== undefined ? fields.eventId : existing.eventId,
			categoryId: fields.categoryId !== undefined ? fields.categoryId : existing.categoryId,
			url: fields.url !== undefined ? fields.url : existing.url,
		});

		this.assertSchedule(
			fields.startsAt !== undefined ? fields.startsAt : existing.startsAt,
			fields.endsAt !== undefined ? fields.endsAt : existing.endsAt,
		);

		if (fields.status === 'ACTIVE' && existing.status !== 'ACTIVE') {
			await this.assertActiveSlotFree();
		}

		const uploaded = await this.uploadImages(files);
		const uploadedPublicIds = [uploaded.image?.publicId, uploaded.imageMobile?.publicId].filter(
			(publicId): publicId is string => Boolean(publicId),
		);

		const updateData: Prisma.BannerUncheckedUpdateInput = {
			...(uploaded.image && {
				imageUrl: uploaded.image.url,
				imagePublicId: uploaded.image.publicId,
			}),
			...(uploaded.imageMobile
				? {
						imageMobileUrl: uploaded.imageMobile.url,
						imageMobilePublicId: uploaded.imageMobile.publicId,
					}
				: removeMobileImage
					? { imageMobileUrl: null, imageMobilePublicId: null }
					: {}),
			...(fields.status !== undefined && { status: fields.status }),
			...(fields.startsAt !== undefined && { startsAt: fields.startsAt ?? null }),
			...(fields.endsAt !== undefined && { endsAt: fields.endsAt ?? null }),
			...(fields.textAlign !== undefined && { textAlign: fields.textAlign }),
			...(fields.theme !== undefined && { theme: fields.theme }),
			// A slide points at one thing, so every edit rewrites all three target columns:
			// otherwise switching the type would leave the previous target behind, ready to
			// come back the next time the type is switched again.
			targetType,
			eventId:
				targetType === 'EVENT'
					? fields.eventId !== undefined
						? fields.eventId
						: existing.eventId
					: null,
			categoryId:
				targetType === 'CATEGORY'
					? fields.categoryId !== undefined
						? fields.categoryId
						: existing.categoryId
					: null,
			url: targetType === 'URL' ? (fields.url !== undefined ? fields.url : existing.url) : null,
			...(translations !== undefined && {
				translations: { deleteMany: {}, create: translations.map(toTranslationRow) },
			}),
		};

		try {
			const banner = await this.prisma.banner.update({
				where: { id },
				data: updateData,
				include: BANNER_INCLUDE,
			});

			await this.deleteReplacedImages(existing, banner);
			await this.bannerService.invalidateCache();

			return banner;
		} catch (error) {
			await this.uploadService.deleteMultipleByPublicId(uploadedPublicIds);
			throw error;
		}
	}

	async delete(id: string): Promise<void> {
		const banner = await this.findOne(id);

		await this.prisma.banner.delete({ where: { id } });

		await this.uploadService.deleteMultipleByPublicId(
			[banner.imagePublicId, banner.imageMobilePublicId].filter((publicId): publicId is string =>
				Boolean(publicId),
			),
		);
		await this.bannerService.invalidateCache();
	}

	async reorder(ids: string[]): Promise<BannerWithTargets[]> {
		await this.prisma.$transaction(
			ids.map((id, index) =>
				this.prisma.banner.updateMany({ where: { id }, data: { sortOrder: index } }),
			),
		);

		await this.bannerService.invalidateCache();

		return this.findAll();
	}

	private async uploadImages(
		files: BannerImageFiles,
	): Promise<{ image?: CloudinaryUploadResult; imageMobile?: CloudinaryUploadResult }> {
		const uploaded: { image?: CloudinaryUploadResult; imageMobile?: CloudinaryUploadResult } = {};

		if (files.image) {
			uploaded.image = await this.uploadService.uploadImage(files.image);
		}

		if (files.imageMobile) {
			try {
				uploaded.imageMobile = await this.uploadService.uploadImage(files.imageMobile);
			} catch (error) {
				if (uploaded.image) {
					await this.uploadService.deleteByPublicId(uploaded.image.publicId);
				}
				throw error;
			}
		}

		return uploaded;
	}

	private async deleteReplacedImages(
		before: BannerWithTargets,
		after: BannerWithTargets,
	): Promise<void> {
		const replaced = [
			before.imagePublicId === after.imagePublicId ? null : before.imagePublicId,
			before.imageMobilePublicId === after.imageMobilePublicId ? null : before.imageMobilePublicId,
		].filter((publicId): publicId is string => Boolean(publicId));

		await this.uploadService.deleteMultipleByPublicId(replaced);
	}

	private async assertTargetExists(
		targetType: CreateBannerData['targetType'],
		target: { eventId?: string | null; categoryId?: string | null; url?: string | null },
	): Promise<void> {
		if (bannerTargetIssue({ targetType, ...target })) {
			throw new AppException(AppErrorCode.BANNER_TARGET_REQUIRED);
		}

		if (targetType === 'EVENT' && target.eventId) {
			const event = await this.prisma.event.findUnique({
				where: { id: target.eventId },
				select: { id: true },
			});
			if (!event) {
				throw new AppException(AppErrorCode.EVENT_NOT_FOUND, { id: target.eventId });
			}
		}

		if (targetType === 'CATEGORY' && target.categoryId) {
			const category = await this.prisma.category.findUnique({
				where: { id: target.categoryId },
				select: { id: true },
			});
			if (!category) {
				throw new AppException(AppErrorCode.CATEGORY_NOT_FOUND, { id: target.categoryId });
			}
		}
	}

	private assertSchedule(startsAt: Date | null | undefined, endsAt: Date | null | undefined): void {
		if (startsAt && endsAt && startsAt.getTime() > endsAt.getTime()) {
			throw new AppException(AppErrorCode.BANNER_INVALID_SCHEDULE);
		}
	}

	private async assertActiveSlotFree(): Promise<void> {
		const active = await this.prisma.banner.count({ where: { status: 'ACTIVE' } });

		if (active >= BANNER_LIMITS.MAX_ACTIVE) {
			throw new AppException(AppErrorCode.TOO_MANY_ACTIVE_BANNERS, { max: BANNER_LIMITS.MAX_ACTIVE });
		}
	}

	private async nextSortOrder(): Promise<number> {
		const last = await this.prisma.banner.aggregate({ _max: { sortOrder: true } });

		return (last._max.sortOrder ?? -1) + 1;
	}
}
