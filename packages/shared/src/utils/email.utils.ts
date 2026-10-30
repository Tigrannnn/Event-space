const POPULAR_EMAIL_DOMAINS = [
	'gmail.com',
	'mail.ru',
	'yahoo.com',
	'outlook.com',
	'hotmail.com',
	'icloud.com',
	'yandex.ru',
	'yandex.com',
	'list.ru',
	'bk.ru',
	'inbox.ru',
	'rambler.ru',
	'protonmail.com',
	'live.com',
	'me.com',
];

function editDistance(a: string, b: string): number {
	let previous = Array.from({ length: b.length + 1 }, (_, index) => index);

	for (let i = 1; i <= a.length; i++) {
		const current = [i];

		for (let j = 1; j <= b.length; j++) {
			current[j] = Math.min(
				previous[j] + 1,
				current[j - 1] + 1,
				previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
			);
		}

		previous = current;
	}

	return previous[b.length];
}

/**
 * A guess at what the person meant when the domain of their email is one letter away from a
 * popular one ("gmial.com", "gmail.con"). Returns the whole corrected address, or null when
 * nothing looks wrong. Only a hint: an address that is really that unusual stays as typed.
 *
 * Short domains tolerate one slip only, since two edits turn "bk.ru" into half the internet.
 */
export function suggestEmailCorrection(email: string): string | null {
	const trimmed = email.trim().toLowerCase();
	const at = trimmed.lastIndexOf('@');
	if (at <= 0) return null;

	const local = trimmed.slice(0, at);
	const domain = trimmed.slice(at + 1);
	if (!domain || POPULAR_EMAIL_DOMAINS.includes(domain)) return null;

	const tolerance = domain.length >= 8 ? 2 : 1;
	let best: string | null = null;
	let bestDistance = tolerance + 1;

	for (const candidate of POPULAR_EMAIL_DOMAINS) {
		const distance = editDistance(domain, candidate);

		if (distance < bestDistance) {
			best = candidate;
			bestDistance = distance;
		}
	}

	return best ? `${local}@${best}` : null;
}
