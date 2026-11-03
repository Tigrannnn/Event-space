import type { PrismaService } from '@infra/prisma/prisma.service';
import { eventMatchesSearch, parseSearchQuery } from '@modules/event/event-search.util';

/**
 * Ids of the events the catalogue search would find for this text, so the admin tables
 * understand transliteration, word endings and typos exactly like the public search does.
 * Undefined when the text has no searchable words.
 */
export async function findMatchingEventIds(
	prisma: PrismaService,
	search: string | undefined,
): Promise<string[] | undefined> {
	const words = search ? parseSearchQuery(search) : [];
	if (words.length === 0) return undefined;

	const events = await prisma.event.findMany({
		select: {
			id: true,
			translations: { select: { title: true, description: true, location: true } },
			category: { select: { translations: { select: { name: true } } } },
		},
	});

	return events.filter((event) => eventMatchesSearch(event, words)).map((event) => event.id);
}
