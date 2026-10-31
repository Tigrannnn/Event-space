import {
	eventMatchesSearch,
	normalizeForSearch,
	parseSearchQuery,
	SearchableEvent,
} from './event-search.util';

function event(
	texts: { ru?: string; en?: string; hy?: string },
	category = 'Экскурсии',
): SearchableEvent {
	return {
		translations: Object.values(texts).map((text) => ({
			title: text,
			description: '',
			location: '',
		})),
		category: { translations: [{ name: category }] },
	};
}

function finds(search: string, target: SearchableEvent): boolean {
	return eventMatchesSearch(target, parseSearchQuery(search));
}

describe('normalizeForSearch', () => {
	it.each([
		['Tsaghkadzor', 'Tsakhkadzor', 'Tsaxkadzor', 'Цахкадзор', 'Ծաղկաձոր'],
		['Yerevan', 'Ереван', 'Երևան'],
		['Dilijan', 'Дилижан', 'Դիլիջան'],
		['Azhdahak', 'Azdahak', 'Аждахак'],
	])('spells %s the same in every alphabet and transliteration', (...spellings) => {
		const normalized = spellings.map(normalizeForSearch);
		expect(new Set(normalized).size).toBe(1);
	});
});

describe('parseSearchQuery', () => {
	it('drops single letters and repeats', () => {
		expect(parseSearchQuery('вино в Арени вино')).toEqual(['vino', 'areni']);
	});

	it('is empty for blank input', () => {
		expect(parseSearchQuery('   ')).toEqual([]);
	});
});

describe('eventMatchesSearch', () => {
	const wine = {
		translations: [
			{ title: 'Винный тур в Арени', description: 'Дегустация вин на заводе', location: 'Арени' },
			{ title: 'Wine tour in Areni', description: 'Wine tasting at a winery', location: 'Areni' },
		],
		category: { translations: [{ name: 'Гастрономия и дегустации' }] },
	};
	const hike = {
		translations: [
			{
				title: 'Поход на гору Аждаак',
				description: 'Вид на Севан с вершины',
				location: 'Гегамский хребет',
			},
		],
		category: { translations: [{ name: 'Походы' }] },
	};

	it('finds a different ending of the same word', () => {
		expect(finds('вино', wine)).toBe(true);
		expect(finds('дегустация', wine)).toBe(true);
	});

	it('does not match a word that only shares two letters', () => {
		expect(finds('вино', hike)).toBe(false);
	});

	it('finds a place through another transliteration or alphabet', () => {
		const tsaghkadzor = event({ en: 'Tsaghkadzor and Lake Sevan' });
		expect(finds('tsaxkadzor', tsaghkadzor)).toBe(true);
		expect(finds('цахкадзор', tsaghkadzor)).toBe(true);
	});

	it('forgives a typo in a longer word', () => {
		expect(finds('gegard', event({ en: 'Garni and Geghard' }))).toBe(true);
		expect(finds('tsagkadzor', event({ en: 'Tsaghkadzor' }))).toBe(true);
	});

	it('finds a short place name with letters added at the end', () => {
		expect(finds('haxpatdt', event({ en: 'Haxpat Monastery' }))).toBe(true);
		expect(finds('haxpatik', event({ en: 'Haxpat Monastery' }))).toBe(true);
	});

	it('finds a short place name with a letter dropped', () => {
		expect(finds('haxpt', event({ en: 'Haxpat Monastery' }))).toBe(true);
		expect(finds('hxpat', event({ en: 'Haxpat Monastery' }))).toBe(true);
	});

	it('finds a name typed without its vowels', () => {
		expect(finds('hxpt', event({ en: 'Haxpat Monastery' }))).toBe(true);
		expect(finds('dlijn', event({ en: 'Dilijan National Park' }))).toBe(true);
		expect(finds('azdahak', event({ en: 'Azhdahak Peak hike' }))).toBe(true);
		expect(finds('adahak', event({ en: 'Azhdahak Peak hike' }))).toBe(true);
		expect(finds('adhak', event({ en: 'Azhdahak Peak hike' }))).toBe(true);
		expect(finds('hazdahak', event({ en: 'Azhdahak Peak hike' }))).toBe(true);
	});

	it('finds a place when the first letter is a neighbouring key', () => {
		expect(finds('baxpat', event({ en: 'Haxpat Monastery' }))).toBe(true);
		expect(finds('axpat', event({ en: 'Haxpat Monastery' }))).toBe(true);
	});

	it('spells k as c', () => {
		const kobuleti = event({ ru: 'Поездка в Кобулети', en: 'Trip to Kobuleti' });
		expect(finds('cobuleti', kobuleti)).toBe(true);
		expect(finds('cobuleti', event({ ru: 'Кобулети' }))).toBe(true);
		expect(finds('kobuleti', event({ en: 'Cobuleti beach' }))).toBe(true);
		expect(finds('cascade', event({ ru: 'Каскад' }))).toBe(true);
	});

	it('keeps ch and ts apart from a plain c', () => {
		expect(finds('chambarak', event({ en: 'Chambarak' }))).toBe(true);
		expect(finds('cambarak', event({ en: 'Chambarak' }))).toBe(true);
		expect(finds('tsaxkadzor', event({ en: 'Tsaghkadzor' }))).toBe(true);
	});

	it('finds a word that is still being typed', () => {
		expect(finds('tate', event({ en: 'Tatev Monastery' }))).toBe(true);
	});

	it('finds a word inside a compound name', () => {
		expect(finds('vank', event({ en: 'Sevanavank' }))).toBe(true);
	});

	it('finds an English plural', () => {
		expect(finds('tours', event({ en: 'Wine tour in Areni' }))).toBe(true);
	});

	// Each of these matched on production data before the rules were tightened.
	it.each([
		['арени', 'Tours that are popular'],
		['поход', 'В плохую погоду маршрут меняется'],
		['tatev', 'Վերցրեք թեթև նախուտեստ'],
		['gegard', 'Гегаркуникская область'],
		['haxpt', 'Hotel and spa packages'],
		['haxpatdt', 'Happy tours for everyone'],
		['sevan', 'Seven days in Yerevan'],
		['tatev', 'Titan town'],
		['hours', 'Tours around Areni'],
		['mother', 'Another day'],
	])('does not let «%s» match «%s»', (search, text) => {
		expect(finds(search, event({ ru: text }))).toBe(false);
	});

	it('requires every word of the query', () => {
		expect(finds('вино арени', wine)).toBe(true);
		expect(finds('вино татев', wine)).toBe(false);
	});

	it('searches category names', () => {
		expect(finds('походы', hike)).toBe(true);
	});

	it('matches everything when the query is empty', () => {
		expect(eventMatchesSearch(hike, [])).toBe(true);
	});
});
