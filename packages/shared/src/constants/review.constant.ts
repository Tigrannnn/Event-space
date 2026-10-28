export const REVIEW_CONFIG = {
	MIN_RATING: 1,
	MAX_RATING: 5,
	TEXT_MAX: 1000,
	REJECT_REASON_MAX: 500,
	ADMIN_REPLY_MAX: 1000,

	/**
	 * How long after a tour ends before its guests may rate it.
	 *
	 * `duration` is what the admin typed when creating the event — a plan, not a measurement,
	 * and tours run late far more often than early. An hour of slack keeps "how was your tour?"
	 * from landing while the group is still on the bus; the invite is sent once, so arriving
	 * early costs the review for good, while arriving late costs a little response rate.
	 */
	OPENS_AFTER_END_MS: 60 * 60 * 1000,

	/** After this the tour is a memory, not an impression. */
	WINDOW_DAYS: 60,

	/** Page size for the reviews under an event. */
	PAGE_SIZE: 10,
} as const;
