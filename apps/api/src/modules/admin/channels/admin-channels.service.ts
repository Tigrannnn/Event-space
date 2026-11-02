import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import {
	AppErrorCode,
	channelNameKey,
	type CreateChannelData,
	type UpdateChannelData,
} from '@event-space/shared';
import { AppException } from '@shared';

export interface ChannelListFilter {
	forBookings?: boolean;
	forReviews?: boolean;
	includeArchived?: boolean;
}

const customCode = (nameKey: string) => `CUSTOM_${createHash('md5').update(nameKey).digest('hex').slice(0, 10)}`;

@Injectable()
export class AdminChannelsService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll({ forBookings, forReviews, includeArchived = false }: ChannelListFilter = {}) {
		const channels = await this.prisma.channel.findMany({
			where: {
				...(includeArchived ? {} : { isActive: true }),
				...(forBookings === undefined ? {} : { forBookings }),
				...(forReviews === undefined ? {} : { forReviews }),
			},
			include: { _count: { select: { bookings: true, reviews: true } } },
			orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
		});

		return channels.map(({ _count, ...channel }) => ({
			...channel,
			bookingsCount: _count.bookings,
			reviewsCount: _count.reviews,
		}));
	}

	async create(data: CreateChannelData) {
		const name = data.name.trim();
		const nameKey = channelNameKey(name);

		try {
			return await this.prisma.channel.create({
				data: {
					code: customCode(nameKey),
					name,
					nameKey,
					forBookings: data.forBookings,
					forReviews: data.forReviews,
				},
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
				throw new AppException(AppErrorCode.CHANNEL_NAME_TAKEN);
			}
			throw error;
		}
	}

	async update(id: string, data: UpdateChannelData) {
		const channel = await this.prisma.channel.findUnique({ where: { id } });
		if (!channel) throw new AppException(AppErrorCode.CHANNEL_NOT_FOUND);
		if (channel.isSystem) throw new AppException(AppErrorCode.CHANNEL_SYSTEM_LOCKED);

		const name = data.name?.trim();
		const nameKey = name === undefined ? undefined : channelNameKey(name);

		try {
			return await this.prisma.channel.update({
				where: { id },
				data: {
					...(name === undefined ? {} : { name, nameKey }),
					...(data.isActive === undefined ? {} : { isActive: data.isActive }),
					...(data.forBookings === undefined ? {} : { forBookings: data.forBookings }),
					...(data.forReviews === undefined ? {} : { forReviews: data.forReviews }),
				},
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
				throw new AppException(AppErrorCode.CHANNEL_NAME_TAKEN);
			}
			throw error;
		}
	}
}
