import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import {
	AppErrorCode,
	sourceNameKey,
	type CreateSourceData,
	type UpdateSourceData,
} from '@event-space/shared';
import { AppException } from '@shared';

@Injectable()
export class AdminSourcesService {
	constructor(private readonly prisma: PrismaService) {}

	findAll({ includeArchived = false, withPlatforms = false } = {}) {
		return this.prisma.source.findMany({
			where: {
				...(withPlatforms ? {} : { kind: 'PARTNER' as const }),
				...(includeArchived ? {} : { isActive: true }),
			},
			orderBy: [{ kind: 'desc' }, { isActive: 'desc' }, { name: 'asc' }],
		});
	}

	async create(data: CreateSourceData) {
		const name = data.name.trim();
		const nameKey = sourceNameKey(name);

		try {
			return await this.prisma.$transaction(async (tx) => {
				const source = await tx.source.create({ data: { code: data.code, name, nameKey } });
				await tx.booking.updateMany({
					where: { sourceId: null, sourceRef: data.code },
					data: { sourceId: source.id },
				});
				return source;
			});
		} catch (error) {
			throw this.uniqueError(error);
		}
	}

	async update(id: string, data: UpdateSourceData) {
		const source = await this.prisma.source.findUnique({ where: { id } });
		if (!source) throw new AppException(AppErrorCode.SOURCE_NOT_FOUND);
		if (source.kind === 'PLATFORM') throw new AppException(AppErrorCode.SOURCE_PLATFORM_LOCKED);

		const name = data.name?.trim();

		try {
			return await this.prisma.source.update({
				where: { id },
				data: {
					...(name === undefined ? {} : { name, nameKey: sourceNameKey(name) }),
					...(data.isActive === undefined ? {} : { isActive: data.isActive }),
				},
			});
		} catch (error) {
			throw this.uniqueError(error);
		}
	}

	private uniqueError(error: unknown) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
			const target = String(error.meta?.target ?? '');
			return new AppException(
				target.includes('code') ? AppErrorCode.SOURCE_CODE_TAKEN : AppErrorCode.SOURCE_NAME_TAKEN,
			);
		}
		return error;
	}
}
