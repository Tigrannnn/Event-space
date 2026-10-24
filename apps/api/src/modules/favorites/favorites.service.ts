import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { AppErrorCode, FAVORITES_PAGE_SIZE } from '@event-space/shared';
import { AppException, encodeKeysetCursor, keysetAfter, KEYSET_ORDER } from '@shared';

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

	async findAllForUser(userId: string, params: { cursor?: string; limit?: number } = {}) {
		const limit = Math.min(Math.max(params.limit ?? FAVORITES_PAGE_SIZE, 1), 50);

		const rows = await this.prisma.favorite.findMany({
			where: { userId, ...(keysetAfter(params.cursor) ?? {}) },
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
			take: limit + 1,
			orderBy: KEYSET_ORDER,
		});

		const hasMore = rows.length > limit;
		const page = hasMore ? rows.slice(0, limit) : rows;
		const last = page[page.length - 1];

		return {
			// The cursor walks the favourite rows, not the events: it is the moment of
			// favouriting that orders this list, and an event can be favourited at any time.
			data: page.map((favorite) => favorite.event),
			nextCursor: hasMore && last ? encodeKeysetCursor(last) : null,
			hasMore,
		};
	}

	/**
	 * Every event id this visitor has favourited.
	 *
	 * The heart on each card and the counter in the header both ask the same question, and
	 * neither needs the events themselves — before this they pulled the whole list, pictures,
	 * translations and dates included, on every page of the site.
	 */
	async findIdsForUser(userId: string): Promise<string[]> {
		const favorites = await this.prisma.favorite.findMany({
			where: { userId },
			select: { eventId: true },
			orderBy: KEYSET_ORDER,
		});

		return favorites.map((favorite) => favorite.eventId);
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
