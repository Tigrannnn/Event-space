/**
 * Catalogue search that forgives how people actually type. A substring match misses "вино"
 * in "дегустация вин" and "tsaxkadzor" in "Tsaghkadzor", so the query and the event text are
 * both folded into one rough Latin spelling, then compared word by word with room for word
 * endings and a typo.
 */

const CYRILLIC: Record<string, string> = {
	а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
	к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
	х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

const ARMENIAN: Record<string, string> = {
	ա: 'a', բ: 'b', գ: 'g', դ: 'd', ե: 'e', զ: 'z', է: 'e', ը: 'e', թ: 't', ժ: 'zh', ի: 'i',
	լ: 'l', խ: 'kh', ծ: 'ts', կ: 'k', հ: 'h', ձ: 'dz', ղ: 'gh', ճ: 'ch', մ: 'm', յ: 'y', ն: 'n',
	շ: 'sh', ո: 'o', չ: 'ch', պ: 'p', ջ: 'j', ռ: 'r', ս: 's', վ: 'v', տ: 't', ր: 'r', ց: 'ts',
	ւ: 'v', փ: 'p', ք: 'k', օ: 'o', ֆ: 'f',
};

/**
 * Spellings that name the same sound in different transliterations — Tsaghkadzor, Tsakhkadzor
 * and Tsaxkadzor all end up as "cahkadzor", Kobuleti and Cobuleti as "kobuleti". A plain "c" is
 * folded into "k" before "ts" and "ch" claim the letter "c" for themselves. Applied in order, so
 * the longer groups go first.
 * Collisions this creates only ever widen a match; they never hide one.
 */
const SOUND_FOLDS: Array<[RegExp, string]> = [
	[/shch/g, 'sh'],
	[/dzh/g, 'j'],
	[/zh/g, 'j'],
	[/[kg]h|x/g, 'h'],
	[/c(?!h)/g, 'k'],
	[/ts|tz|ch/g, 'c'],
	[/sh/g, 's'],
	[/ph/g, 'p'],
	[/th/g, 't'],
	[/q/g, 'k'],
	[/w/g, 'v'],
	[/ye/g, 'e'],
	[/y/g, 'i'],
	[/(.)\1+/g, '$1'],
];

export function normalizeForSearch(text: string): string {
	let result = text
		.toLowerCase()
		.normalize('NFKD')
		.replace(/\p{M}/gu, '')
		.replace(/ու/g, 'u');

	result = Array.from(result, (char) => CYRILLIC[char] ?? ARMENIAN[char] ?? char).join('');

	for (const [pattern, replacement] of SOUND_FOLDS) {
		result = result.replace(pattern, replacement);
	}

	return result
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();
}

/** The words of a search query, normalized. Empty when there is nothing worth searching for. */
export function parseSearchQuery(search: string): string[] {
	const words = normalizeForSearch(search)
		.split(' ')
		.filter((word) => word.length >= 2);
	return [...new Set(words)];
}

function commonPrefixLength(a: string, b: string): number {
	let i = 0;
	while (i < a.length && i < b.length && a[i] === b[i]) i++;
	return i;
}

/** Levenshtein distance with adjacent swaps counted as one edit. */
function editDistance(a: string, b: string): number {
	const rows = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array<number>(b.length).fill(0)]);
	for (let j = 1; j <= b.length; j++) rows[0][j] = j;

	for (let i = 1; i <= a.length; i++) {
		for (let j = 1; j <= b.length; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
			if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
				rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
			}
		}
	}
	return rows[a.length][b.length];
}

function consonantSkeleton(word: string): string {
	return word.replace(/[aeiou]/g, '').replace(/(.)\1+/g, '$1');
}

/** Letters a word can end in without changing what it means: Russian endings, English plurals. */
const ENDING = /^[aeious]{1,2}$/;

function wordsMatch(query: string, word: string): boolean {
	// Still being typed: "tate" → "tatev".
	if (word.startsWith(query)) return true;
	if (query.length < 3) return false;

	// Part of a compound: "vank" → "sevanavank".
	if (query.length >= 4 && word.includes(query)) return true;

	// The same word with another ending: "вино" → "вин", "винный"; "дегустация" → "дегустации".
	// Only an ending-like tail of the query may differ, so "арени" doesn't match "are" and
	// "гегард" doesn't match "Гегаркуникская".
	const prefix = commonPrefixLength(query, word);
	if (prefix >= 3 && ENDING.test(query.slice(prefix))) return true;

	// The first letter is the one people miss by a neighbouring key: "baxpat" for "haxpat". Safe
	// only for a longer word with everything after it intact, where nothing else fits that gap.
	if (query.length >= 6 && query.length === word.length && query.slice(1) === word.slice(1)) {
		return true;
	}

	// A typo in a word whose start is right: "gegard" → "geghard", "haxpt" → "haxpat",
	// "haxpatdt" → "haxpat". The allowance grows with the word — a quarter of its length — so a
	// six-letter place name forgives one slip and an eight-letter query two. A five-letter query
	// must also share its first three letters and may only lose or gain a letter: swap one for
	// another and "sevan" is "seven", "арени" is "Армении" and "поход" is "погода".
	const longer = Math.max(query.length, word.length);
	const sameLength = query.length === word.length;
	const allowedEdits = query.length < 5 || (longer <= 5 && sameLength) ? 0 : Math.floor(longer / 4);
	const requiredPrefix = query.length >= 6 ? 2 : 3;

	if (allowedEdits > 0 && prefix >= requiredPrefix && editDistance(query, word) <= allowedEdits) {
		return true;
	}

	// A name typed without some of its vowels: "hxpt" and "haxpt" are both "haxpat". Same first
	// letter, at least three consonants, and the query has to be the shorter one — swapping a
	// vowel for another ("sevan" for "seven") is a different word, not a dropped letter.
	const skeleton = consonantSkeleton(query);
	return (
		query.length >= 3 &&
		query.length < word.length &&
		word.length >= 5 &&
		query[0] === word[0] &&
		skeleton.length >= 3 &&
		skeleton === consonantSkeleton(word)
	);
}

export interface SearchableEvent {
	translations: Array<{ title: string; description: string; location: string }>;
	category?: { translations: Array<{ name: string }> } | null;
}

/**
 * Whether an event matches every word of the query. Titles, descriptions and locations are
 * searched in all languages at once, so a Russian query finds an event through its Russian
 * text and a Latin one through its English text.
 */
export function eventMatchesSearch(event: SearchableEvent, queryWords: string[]): boolean {
	if (queryWords.length === 0) return true;

	const text = [
		...event.translations.flatMap((t) => [t.title, t.description, t.location]),
		...(event.category?.translations.map((t) => t.name) ?? []),
	].join(' ');
	const words = [...new Set(normalizeForSearch(text).split(' ').filter(Boolean))];

	return queryWords.every((query) => words.some((word) => wordsMatch(query, word)));
}
