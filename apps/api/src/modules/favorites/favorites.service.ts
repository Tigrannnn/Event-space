import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { AppErrorCode } from '@event-space/shared';
import { AppException } from '@shared';

@Injectable()
export class FavoritesService {
	constructor(private readonly prisma: PrismaService) {}

	async add(userId: string, eventId: string): Promise<{ favorited: boolean }> {
		const event = await this.prisma.event.findUnique({ where: { id: eventId } });
		if (!event) throw new AppException(AppErrorCode.EVENT_NOT_FOUND);

		const existing = await this.prisma.favorite.findUnique({
			where: { userId_eventId: { userId, eventId } },
		});

		if (existing) {
			return { favorited: true };
		}

		await this.prisma.favorite.create({ data: { userId, eventId } });
		return { favorited: true };
	}

	async remove(userId: string, eventId: string): Promise<{ favorited: boolean }> {
		const event = await this.prisma.event.findUnique({ where: { id: eventId } });
		if (!event) throw new AppException(AppErrorCode.EVENT_NOT_FOUND);

		const existing = await this.prisma.favorite.findUnique({
			where: { userId_eventId: { userId, eventId } },
		});

		if (!existing) {
			return { favorited: false };
		}

		await this.prisma.favorite.delete({ where: { id: existing.id } });
		return { favorited: false };
	}

	async findAllForUser(userId: string) {
		const favorites = await this.prisma.favorite.findMany({
			where: { userId },
			include: {
				event: {
					include: {
						translations: true,
						category: { include: { translations: true } },
						occurrences: true,
						images: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});

		return favorites.map((favorite) => favorite.event);
	}

	async isFavorited(userId: string | undefined, eventId: string): Promise<boolean> {
		if (!userId) return false;

		return (await this.getFavoritedEventIds(userId, [eventId])).length > 0;
	}

	async getFavoritedEventIds(userId: string | undefined, eventIds: string[]): Promise<string[]> {
		if (!userId || eventIds.length === 0) return [];

		const favorites = await this.prisma.favorite.findMany({
			where: { userId, eventId: { in: eventIds } },
			select: { eventId: true },
		});

		return favorites.map((f) => f.eventId);
	}
}
