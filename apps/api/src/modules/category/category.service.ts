import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { AppErrorCode, CreateCategoryData, UpdateCategoryData } from '@event-space/shared';
import { AppException } from '@shared';

@Injectable()
export class CategoryService {
	constructor(private readonly prisma: PrismaService) {}

	private readonly categoryInclude = {
		translations: true,
	};

	async findAll() {
		return await this.prisma.category.findMany({
			include: this.categoryInclude,
		});
	}

	async findOne(id: string) {
		const category = await this.prisma.category.findUnique({
			where: { id },
			include: this.categoryInclude,
		});
		if (!category) {
			throw new AppException(AppErrorCode.CATEGORY_NOT_FOUND, { id });
		}
		return category;
	}

	async create(data: CreateCategoryData) {
		const { translations, ...pureCategoryData } = data;
		return await this.prisma.category.create({
			data: {
				...pureCategoryData,
				translations: {
					create: translations,
				},
			},
			include: this.categoryInclude,
		});
	}

	async update(id: string, data: UpdateCategoryData) {
		const { translations, ...pureCategoryData } = data;
		return await this.prisma.category.update({
			where: { id },
			data: {
				...pureCategoryData,
				...(translations !== undefined && {
					translations: {
						deleteMany: {},
						create: translations,
					},
				}),
			},
			include: this.categoryInclude,
		});
	}

	async delete(id: string) {
		await this.findOne(id); // Check if exists
		return await this.prisma.category.delete({
			where: { id },
			include: this.categoryInclude,
		});
	}
}
