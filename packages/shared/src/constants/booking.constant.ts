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

		/** Max promo code guesses per user per 5 minutes — a real typo or two is never blocked,
		 *  scripted guessing of codes is. */
		PROMO_VALIDATE_MAX_PER_WINDOW: 10,
		PROMO_VALIDATE_WINDOW_SEC: 300,
	},
} as const;

/** Page size for the visitor's own booking list (infinite scroll). */
export const MY_BOOKINGS_PAGE_SIZE = 12;
