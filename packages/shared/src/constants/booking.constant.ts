export const BOOKING_CONFIG = {
	KEY_PREFIX: 'booking',
	RATE_LIMITS: {
		/** Max booking attempts per user per minute */
		CREATE_MAX_PER_MINUTE: 10,
		CREATE_WINDOW_SEC: 60,

		/** Max payment attempts per user per hour */
		PAYMENT_MAX_PER_HOUR: 20,
		PAYMENT_WINDOW_SEC: 3600,

		/** Max cancellation attempts per user per hour */
		CANCEL_MAX_PER_HOUR: 30,
		CANCEL_WINDOW_SEC: 3600,
	},
} as const;
