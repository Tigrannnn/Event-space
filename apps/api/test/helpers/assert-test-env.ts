const TEST_DB_MARKERS = ['_test', 'event_space_test'];

export function assertTestDatabaseUrl(url = process.env.DATABASE_URL): void {
	if (!url) {
		throw new Error('DATABASE_URL is missing. Use .env.test for e2e (see .env.test.example).');
	}

	const isTestDb = TEST_DB_MARKERS.some((marker) => url.includes(marker));
	if (!isTestDb) {
		throw new Error(
			`Refusing to run e2e against "${url}". ` +
				`DATABASE_URL must contain "_test" (e.g. database event_space_test). ` +
				`Copy .env.test.example → .env.test`,
		);
	}
}

export function assertTestRedisUrl(url = process.env.REDIS_URL): void {
	if (!url) {
		throw new Error('REDIS_URL is missing in .env.test');
	}

	// Dev uses db 0; tests must use another logical DB or a dedicated instance.
	if (!url.includes('/1') && !url.includes('test')) {
		throw new Error(
			`Refusing to flush Redis at "${url}". ` +
				`Set REDIS_URL=redis://localhost:6379/1 in .env.test`,
		);
	}
}
