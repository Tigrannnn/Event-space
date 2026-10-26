import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import { AppException } from '@shared';
import { AppErrorCode, isUuid } from '@event-space/shared';
import type { CreatePromoCodeData, PaginatedParams, UpdatePromoCodeData } from '@event-space/shared';
import { toPage } from '../common/query-helpers';

@Injectable()
export class AdminPromoCodesService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll({ skip = 0, limit = 20, search }: PaginatedParams & { search?: string } = {}) {
		const where = search
			? {
					OR: [
						...(isUuid(search) ? [{ id: search }] : []),
						{ code: { contains: search, mode: 'insensitive' as const } },
					],
				}
			: {};

		const [promoCodes, total] = await Promise.all([
			this.prisma.promoCode.findMany({
				where,
				skip,
				take: limit + 1,
				orderBy: { createdAt: 'desc' },
			}),
			this.prisma.promoCode.count({ where }),
		]);

		return toPage(promoCodes, total, skip, limit);
	}

	findOne(id: string) {
		return this.prisma.promoCode.findUnique({ where: { id } });
	}

	async create(data: CreatePromoCodeData) {
		try {
			return await this.prisma.promoCode.create({ data });
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
				throw new AppException(AppErrorCode.PROMO_CODE_ALREADY_EXISTS);
			}
			throw error;
		}
	}

	async update(id: string, data: UpdatePromoCodeData) {
		try {
			return await this.prisma.promoCode.update({ where: { id }, data });
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
				throw new AppException(AppErrorCode.PROMO_CODE_ALREADY_EXISTS);
			}
			throw error;
		}
	}

	delete(id: string) {
		return this.prisma.promoCode.delete({ where: { id } });
	}
}
