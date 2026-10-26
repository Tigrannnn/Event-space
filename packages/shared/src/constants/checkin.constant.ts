export const CHECKIN_CONFIG = {
	/** A QR code works until the tour is over, plus a day — late arrivals still scan. */
	EXPIRES_AFTER_EVENT_MS: 24 * 60 * 60 * 1000,
} as const;
