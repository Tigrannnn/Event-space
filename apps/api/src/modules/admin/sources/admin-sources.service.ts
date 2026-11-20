import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import {
	AppErrorCode,
	sourceNameKey,
	type CreateSourceData,
	type SourceList,
	type SourceRevenueRow,
	type UpdateSourceData,
} from '@event-space/shared';
import { AppException } from '@shared';
import { endOfDay, startOfDay } from '../../../shared/utils/app-day.util';
import {
	emptyTotals,
	NONE_KEY,
	SOURCE_BOOKING_SELECT,
	totalsBySource,
	type SourceBookingRow,
} from './source-totals';

@Injectable()
export class AdminSourcesService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll({ includeArchived = false }: { includeArchived?: boolean } = {}): Promise<SourceList> {
		const [sources, rows] = await Promise.all([
			this.prisma.source.findMany({
				where: includeArchived ? {} : { isActive: true },
				orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
			}),
			this.loadBookings({ status: 'CONFIRMED' }),
		]);

		const totals = totalsBySource(rows, new Date());

		const unknown = [...totals.entries()]
			.filter(([key]) => key.startsWith('ref:'))
			.map(([key, sum]) => ({ ref: key.slice(4), totals: sum }))
			.sort((a, b) => b.totals.bookings - a.totals.bookings);

		return {
			sources: sources.map((source) => ({ ...source, totals: totals.get(source.id) ?? emptyTotals() })),
			unknown,
			unspecified: totals.get(NONE_KEY) ?? emptyTotals(),
		};
	}

	async revenue(from: string, to: string): Promise<SourceRevenueRow[]> {
		const [rows, sources] = await Promise.all([
			this.loadBookings({
				status: 'CONFIRMED',
				occurrence: { date: { gte: startOfDay(from), lte: endOfDay(to) } },
			}),
			this.prisma.source.findMany({ select: { id: true, name: true } }),
		]);

		const names = new Map(sources.map((source) => [source.id, source.name]));

		return [...totalsBySource(rows, new Date()).entries()]
			.map(([key, totals]) => {
				if (key === NONE_KEY) return { sourceId: null, ref: null, name: null, totals };
				if (key.startsWith('ref:')) return { sourceId: null, ref: key.slice(4), name: null, totals };
				return { sourceId: key, ref: null, name: names.get(key) ?? null, totals };
			})
			.sort((a, b) => b.totals.amount - a.totals.amount);
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

	private loadBookings(where: Prisma.BookingWhereInput): Promise<SourceBookingRow[]> {
		return this.prisma.booking.findMany({ where, select: SOURCE_BOOKING_SELECT });
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
