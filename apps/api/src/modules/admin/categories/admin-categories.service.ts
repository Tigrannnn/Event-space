import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { isUuid } from '@event-space/shared';
import type {
	Category,
	CreateCategoryData,
	PaginatedParams,
	UpdateCategoryData,
} from '@event-space/shared';
import { toPage } from '../common/query-helpers';

const WITH_TRANSLATIONS = { translations: true } as const;

@Injectable()
export class AdminCategoriesService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll({ skip = 0, limit = 20, search }: PaginatedParams & { search?: string } = {}) {
		const where = search
			? {
					OR: [
						...(isUuid(search) ? [{ id: search }] : []),
						{
							translations: {
								some: { name: { contains: search, mode: 'insensitive' as const } },
							},
						},
					],
				}
			: {};

		const [categories, total] = await Promise.all([
			this.prisma.category.findMany({
				where,
				skip,
				take: limit + 1,
				orderBy: { createdAt: 'desc' },
				include: WITH_TRANSLATIONS,
			}),
			this.prisma.category.count({ where }),
		]);

		return toPage(categories, total, skip, limit);
	}

	findOne(id: string): Promise<Category | null> {
		return this.prisma.category.findUnique({ where: { id }, include: WITH_TRANSLATIONS });
	}

	create(data: CreateCategoryData) {
		const { translations, ...pureData } = data;

		return this.prisma.category.create({
			data: { ...pureData, translations: { create: translations } },
			include: WITH_TRANSLATIONS,
		});
	}

	update(id: string, data: UpdateCategoryData) {
		const { translations, ...pureData } = data;

		return this.prisma.category.update({
			where: { id },
			data: {
				...pureData,
				...(translations !== undefined && {
					translations: { deleteMany: {}, create: translations },
				}),
			},
			include: WITH_TRANSLATIONS,
		});
	}

	delete(id: string) {
		return this.prisma.category.delete({ where: { id }, include: WITH_TRANSLATIONS });
	}
}
