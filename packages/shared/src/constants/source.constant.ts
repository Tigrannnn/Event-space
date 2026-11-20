export const SOURCE_CONFIG = {
	KEY_PREFIX: 'source',
	RATE_LIMITS: {
		VISIT_MAX_PER_MINUTE: 20,
		VISIT_WINDOW_SEC: 60,
	},
} as const;

export const ANALYTICS_CONFIG = {
	KEY_PREFIX: 'analytics',
	RATE_LIMITS: {
		TRACK_MAX_PER_MINUTE: 120,
		TRACK_WINDOW_SEC: 60,
	},
} as const;
