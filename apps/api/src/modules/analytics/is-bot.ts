const BOT_PATTERN =
	/bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|whatsapp|telegram|vkshare|curl|wget|python|axios|node-fetch/i;

export function isBot(userAgent: string | undefined): boolean {
	return !userAgent || BOT_PATTERN.test(userAgent);
}
