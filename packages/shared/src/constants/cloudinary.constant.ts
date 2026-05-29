/** Cloudinary integration settings shared by API upload and cleanup jobs. */
export const CLOUDINARY_CONFIG = {
	UPLOAD_FOLDER: 'event-space',
	DELETE_QUEUE: {
		PENDING_ZSET: 'cloudinary:delete:pending',
		ATTEMPTS_KEY_PREFIX: 'cloudinary:delete:attempts:',
		MAX_ATTEMPTS: 5,
		/** Backoff delays (seconds) after failed delete attempts 1–5. */
		RETRY_DELAYS_SEC: [60, 300, 900, 3600, 21_600] as const,
		/** How often the retry worker polls Redis (ms). */
		PROCESS_INTERVAL_MS: 30_000,
		/** Max deletes processed per worker tick. */
		BATCH_SIZE: 20,
		/** TTL for attempt counters (7 days). */
		ATTEMPTS_TTL_SEC: 7 * 24 * 60 * 60,
	},
	RECONCILIATION: {
		/** Interval between orphan scans (ms). Default: 24h. */
		INTERVAL_MS: 24 * 60 * 60 * 1000,
		/** Delay before the first reconciliation run after startup (ms). */
		INITIAL_DELAY_MS: 10 * 60 * 1000,
	},
} as const;
