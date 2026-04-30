const ACCESS_TOKEN_MINUTES = 15;
const REFRESH_TOKEN_DAYS = 15;

export const AUTH_CONFIG = {
	KEY_PREFIX: 'auth',

	STRATEGY: {
		BCRYPT_SALT_ROUNDS: 12,
		REFRESH_TOKEN_BYTES: 32,
	},
	ACCESS: {
		ACCESS_TOKEN_EXPIRY: `${ACCESS_TOKEN_MINUTES}m`,
		ACCESS_TOKEN_EXPIRY_MS: ACCESS_TOKEN_MINUTES * 60 * 1000,
	},
	REFRESH: {
		REFRESH_TOKEN_EXPIRY_DAYS: REFRESH_TOKEN_DAYS,
		REFRESH_TOKEN_EXPIRY_MS: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
	},
	OTP: {
		EXPIRY_SECONDS: 900,
		DIGITS: 6,
	},
	RATE_LIMITS: {
		OTP_RESEND_COOLDOWN_SEC: 60,

		/** You can make this many unsuccessful attempts from one Email + IP */
		OTP_LOCAL_MAX_ATTEMPTS: 5,

		/** You can make this many unsuccessful attempts from one Email */
		OTP_GLOBAL_MAX_ATTEMPTS: 25,

		/** You will be blocked for this amount of time for unsuccessful attempts from one Email + IP (15 min) */
		OTP_LOCAL_LOCKOUT_SEC: 900,

		/** You will be blocked for this amount of time for unsuccessful attempts from one Email (12 hours) */
		OTP_GLOBAL_LOCKOUT_SEC: 43200,
	},
} as const;
