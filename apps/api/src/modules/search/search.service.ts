import { Injectable } from '@nestjs/common';
import type {
	SearchHistoryItem,
	SearchSuggestedCategory,
	SearchSuggestedEvent,
	SearchSuggestions,
} from '@event-space/shared';
import {
	EventOccurrenceStatusEnum,
	EventStatusEnum,
	SEARCH_QUERY_MAX_LENGTH,
	SEARCH_QUERY_MIN_LENGTH,
} from '@event-space/shared';
import { PrismaService } from '@infra/prisma/prisma.service';
import { eventMatchesSearch, parseSearchQuery } from '../event/event-search.util';

const SUGGESTED_EVENTS = 5;
const SUGGESTED_CATEGORIES = 3;
const RECOMMENDED_EVENTS = 5;
const HISTORY_SHOWN = 6;
const HISTORY_SCANNED = 60;
const POPULARITY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const SAME_QUERY_COOLDOWN_MS = 60 * 1000;

const suggestInclude = {
	translations: { select: { locale: true, title: true, location: true, description: true } },
	images: { orderBy: { order: 'asc' as const }, take: 1, select: { url: true } },
	category: { select: { translations: { select: { locale: true, name: true } } } },
} as const;

type SuggestRow = Awaited<ReturnType<SearchService['bookableEvents']>>[number];

export function normalizeHistoryQuery(query: string): string {
	return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

@Injectable()
export class SearchService {
	constructor(private readonly prisma: PrismaService) {}

	async suggest(search: string): Promise<SearchSuggestions> {
		const words = parseSearchQuery(search);
		if (words.length === 0) return { events: [], categories: [] };

		const [events, categories] = await Promise.all([
			this.bookableEvents(),
			this.prisma.category.findMany({
				select: { slug: true, translations: { select: { locale: true, name: true } } },
			}),
		]);

		const matching = events.filter((event) => eventMatchesSearch(event, words));

		// A tour named after the query comes before one that only mentions it in its text.
		const named = (event: SuggestRow) =>
			eventMatchesSearch(
				{
					translations: event.translations.map((t) => ({
						title: t.title,
						description: '',
						location: '',
					})),
				},
				words,
			);

		const ranked = matching
			.map((event) => ({ event, named: named(event) }))
			.sort((a, b) => Number(b.named) - Number(a.named))
			.slice(0, SUGGESTED_EVENTS)
			.map(({ event }) => this.toSuggestedEvent(event));

		const matchingCategories: SearchSuggestedCategory[] = categories
			.filter((category) =>
				eventMatchesSearch(
					{ translations: [], category: { translations: category.translations } },
					words,
				),
			)
			.slice(0, SUGGESTED_CATEGORIES);

		return { events: ranked, categories: matchingCategories };
	}

	/**
	 * What to show before anyone has typed: the tours booked most over the last month, topped up
	 * with random ones when there are too few bookings to fill the list.
	 */
	async recommended(): Promise<SearchSuggestedEvent[]> {
		const events = await this.bookableEvents();
		if (events.length === 0) return [];

		const bookings = await this.prisma.booking.findMany({
			where: {
				status: 'CONFIRMED',
				createdAt: { gte: new Date(Date.now() - POPULARITY_WINDOW_MS) },
				occurrence: { eventId: { in: events.map((event) => event.id) } },
			},
			select: { occurrence: { select: { eventId: true } } },
		});

		const booked = new Map<string, number>();
		for (const booking of bookings) {
			const eventId = booking.occurrence.eventId;
			booked.set(eventId, (booked.get(eventId) ?? 0) + 1);
		}

		const popular = events
			.filter((event) => booked.has(event.id))
			.sort((a, b) => (booked.get(b.id) ?? 0) - (booked.get(a.id) ?? 0))
			.slice(0, RECOMMENDED_EVENTS);

		const chosen = new Set(popular.map((event) => event.id));
		const filler = shuffle(events.filter((event) => !chosen.has(event.id))).slice(
			0,
			RECOMMENDED_EVENTS - popular.length,
		);

		return [...popular, ...filler].map((event) => this.toSuggestedEvent(event));
	}

	async history(userId: string): Promise<SearchHistoryItem[]> {
		const rows = await this.prisma.searchQuery.findMany({
			where: { userId, hidden: false },
			orderBy: { createdAt: 'desc' },
			take: HISTORY_SCANNED,
			select: { id: true, query: true, normalized: true },
		});

		const seen = new Set<string>();
		const items: SearchHistoryItem[] = [];
		for (const row of rows) {
			if (seen.has(row.normalized)) continue;
			seen.add(row.normalized);
			items.push({ id: row.id, query: row.query });
			if (items.length === HISTORY_SHOWN) break;
		}

		return items;
	}

	async record(userId: string, query: string): Promise<void> {
		const text = query.trim().slice(0, SEARCH_QUERY_MAX_LENGTH);
		if (text.length < SEARCH_QUERY_MIN_LENGTH) return;

		const normalized = normalizeHistoryQuery(text);
		const latest = await this.prisma.searchQuery.findFirst({
			where: { userId, normalized },
			orderBy: { createdAt: 'desc' },
			select: { createdAt: true },
		});

		if (latest && Date.now() - latest.createdAt.getTime() < SAME_QUERY_COOLDOWN_MS) return;

		await this.prisma.searchQuery.create({ data: { userId, query: text, normalized } });
	}

	async forget(userId: string, id: string): Promise<void> {
		const row = await this.prisma.searchQuery.findFirst({
			where: { id, userId },
			select: { normalized: true },
		});
		if (!row) return;

		await this.prisma.searchQuery.updateMany({
			where: { userId, normalized: row.normalized },
			data: { hidden: true },
		});
	}

	bookableEvents() {
		return this.prisma.event.findMany({
			where: {
				status: EventStatusEnum.enum.PUBLISHED,
				occurrences: {
					some: { date: { gt: new Date() }, status: EventOccurrenceStatusEnum.enum.ACTIVE },
				},
			},
			include: {
				...suggestInclude,
				occurrences: {
					where: { date: { gt: new Date() }, status: EventOccurrenceStatusEnum.enum.ACTIVE },
					orderBy: { date: 'asc' },
					select: { date: true },
				},
			},
			orderBy: { id: 'asc' },
		});
	}

	private toSuggestedEvent(event: SuggestRow): SearchSuggestedEvent {
		return {
			id: event.id,
			price: Number(event.price),
			imageUrl: event.images[0]?.url ?? null,
			nextDate: event.occurrences[0]?.date ?? null,
			translations: event.translations.map(({ locale, title, location }) => ({
				locale,
				title,
				location,
			})),
			categoryTranslations: event.category.translations,
		};
	}
}

function shuffle<T>(items: T[]): T[] {
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}
