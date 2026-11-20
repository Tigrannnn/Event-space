export const ANALYTICS_CONFIG = {
	KEY_PREFIX: 'analytics',
	RATE_LIMITS: {
		TRACK_MAX_PER_MINUTE: 120,
		TRACK_WINDOW_SEC: 60,
	},
} as const;
