export const ADMIN_CONFIG = {
	KEY_PREFIX: 'admin',
	RATE_LIMITS: {
		/** Max admin actions per minute (status updates, role changes, etc.) */
		ACTION_MAX_PER_MINUTE: 30,
		ACTION_WINDOW_SEC: 60,

		/** Max deletions per hour for admin operations */
		DELETE_MAX_PER_HOUR: 10,
		DELETE_WINDOW_SEC: 3600,
	},
} as const;
