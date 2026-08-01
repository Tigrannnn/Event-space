/**
 * Stable identifiers for API errors, shared by the API and the web app.
 *
 * The API sends the code; the web app looks up a translated message for it. The English
 * text that travels alongside a code in the response is for logs and debugging only —
 * it is never shown to the user, so changing it is safe. Changing a code value is not:
 * it is part of the API contract and the key of a translation.
 */
export enum AppErrorCode {
	/**
	 * Generic codes, derived from the HTTP status of any error that has not been given a
	 * domain code yet. They keep unmigrated endpoints translated — vaguely, but in the
	 * user's language.
	 */
	BAD_REQUEST = 'BAD_REQUEST',
	UNAUTHORIZED = 'UNAUTHORIZED',
	FORBIDDEN = 'FORBIDDEN',
	NOT_FOUND = 'NOT_FOUND',
	CONFLICT = 'CONFLICT',
	VALIDATION_FAILED = 'VALIDATION_FAILED',
	TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
	SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
	INTERNAL_ERROR = 'INTERNAL_ERROR',

	/** Registration and email verification. */
	EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
	INVALID_VERIFICATION_CODE = 'INVALID_VERIFICATION_CODE',
	EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',

	/** Password login. */
	INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
	SOCIAL_LOGIN_REQUIRED = 'SOCIAL_LOGIN_REQUIRED',
	INVALID_RESET_CODE = 'INVALID_RESET_CODE',

	/** Google login. */
	GOOGLE_AUTH_FAILED = 'GOOGLE_AUTH_FAILED',
	GOOGLE_EMAIL_MISSING = 'GOOGLE_EMAIL_MISSING',
	GOOGLE_EMAIL_NOT_VERIFIED = 'GOOGLE_EMAIL_NOT_VERIFIED',

	/** Session and refresh tokens. */
	REFRESH_TOKEN_MISSING = 'REFRESH_TOKEN_MISSING',
	REFRESH_TOKEN_EXPIRED = 'REFRESH_TOKEN_EXPIRED',
	REFRESH_TOKEN_REUSED = 'REFRESH_TOKEN_REUSED',
	INVALID_TOKEN_FORMAT = 'INVALID_TOKEN_FORMAT',
	ACCESS_DENIED = 'ACCESS_DENIED',
	INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

	/** Deleting something participants are already booked onto. */
	OCCURRENCE_HAS_BOOKINGS = 'OCCURRENCE_HAS_BOOKINGS',
	OCCURRENCES_HAVE_BOOKINGS = 'OCCURRENCES_HAVE_BOOKINGS',
	EVENT_HAS_BOOKINGS = 'EVENT_HAS_BOOKINGS',

	/** OTP throttling. */
	OTP_RESEND_COOLDOWN = 'OTP_RESEND_COOLDOWN',
	TOO_MANY_ATTEMPTS_FROM_DEVICE = 'TOO_MANY_ATTEMPTS_FROM_DEVICE',
	ACCOUNT_UNDER_PROTECTION = 'ACCOUNT_UNDER_PROTECTION',

	/** Looking up something that doesn't exist. */
	OCCURRENCE_NOT_FOUND = 'OCCURRENCE_NOT_FOUND',
	EVENT_NOT_FOUND = 'EVENT_NOT_FOUND',
	BOOKING_NOT_FOUND = 'BOOKING_NOT_FOUND',
	CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',
	USER_NOT_FOUND = 'USER_NOT_FOUND',
	CURRENT_USER_NOT_FOUND = 'CURRENT_USER_NOT_FOUND',

	/** Creating or changing a booking. */
	EVENT_NOT_AVAILABLE_FOR_BOOKING = 'EVENT_NOT_AVAILABLE_FOR_BOOKING',
	ALREADY_BOOKED = 'ALREADY_BOOKED',
	NO_SPOTS_AVAILABLE = 'NO_SPOTS_AVAILABLE',
	NOT_ENOUGH_SPOTS = 'NOT_ENOUGH_SPOTS',
	BOOKING_USER_OR_NAME_REQUIRED = 'BOOKING_USER_OR_NAME_REQUIRED',
	NOT_YOUR_BOOKING = 'NOT_YOUR_BOOKING',
	PAYMENT_SERVICE_UNAVAILABLE = 'PAYMENT_SERVICE_UNAVAILABLE',
	BOOKING_ALREADY_CANCELLED = 'BOOKING_ALREADY_CANCELLED',
	UNABLE_TO_RELEASE_SPOTS = 'UNABLE_TO_RELEASE_SPOTS',
	BOOKING_NOT_CONFIRMED = 'BOOKING_NOT_CONFIRMED',
	ALREADY_CHECKED_IN = 'ALREADY_CHECKED_IN',
	INVALID_REFERENCE_NUMBER = 'INVALID_REFERENCE_NUMBER',
	BOOKING_NO_PAYMENT_INTENT = 'BOOKING_NO_PAYMENT_INTENT',

	/** Creating or editing an event. */
	OCCURRENCE_IN_PAST = 'OCCURRENCE_IN_PAST',
	IMAGE_NOT_IN_EVENT = 'IMAGE_NOT_IN_EVENT',
	DUPLICATE_IMAGE_IDS = 'DUPLICATE_IMAGE_IDS',
	INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
	IMAGES_REQUIRED = 'IMAGES_REQUIRED',
	PAYLOAD_REQUIRED = 'PAYLOAD_REQUIRED',
	INVALID_JSON_PAYLOAD = 'INVALID_JSON_PAYLOAD',
	DUPLICATE_IMAGE_ORDERS = 'DUPLICATE_IMAGE_ORDERS',
	NON_CONTIGUOUS_IMAGE_ORDERS = 'NON_CONTIGUOUS_IMAGE_ORDERS',
	FILE_COUNT_MISMATCH = 'FILE_COUNT_MISMATCH',
	TOO_MANY_IMAGES = 'TOO_MANY_IMAGES',

	/** Validating an uploaded image file. */
	IMAGE_FILE_EMPTY = 'IMAGE_FILE_EMPTY',
	IMAGE_FILE_TOO_LARGE = 'IMAGE_FILE_TOO_LARGE',
	IMAGE_FILE_INVALID_TYPE = 'IMAGE_FILE_INVALID_TYPE',
	IMAGE_FILE_NOT_AN_IMAGE = 'IMAGE_FILE_NOT_AN_IMAGE',
	IMAGE_FILE_EXTENSION_MISMATCH = 'IMAGE_FILE_EXTENSION_MISMATCH',

	/** Cloudinary upload. */
	NO_FILE_PROVIDED = 'NO_FILE_PROVIDED',
	FILE_BUFFER_EMPTY = 'FILE_BUFFER_EMPTY',
	PUBLIC_ID_REQUIRED = 'PUBLIC_ID_REQUIRED',
	UPLOAD_FAILED = 'UPLOAD_FAILED',

	/** Miscellaneous. */
	INVALID_QUERY_PARAM = 'INVALID_QUERY_PARAM',
	INVALID_WEBHOOK_SIGNATURE = 'INVALID_WEBHOOK_SIGNATURE',
	INVALID_WEBHOOK_REQUEST = 'INVALID_WEBHOOK_REQUEST',
	EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED',
}

/** Values interpolated into a translated error message, e.g. `{ id }` or `{ minutes }`. */
export type AppErrorParams = Record<string, string | number>;

const APP_ERROR_CODES = new Set<string>(Object.values(AppErrorCode));

export function isAppErrorCode(value: unknown): value is AppErrorCode {
	return typeof value === 'string' && APP_ERROR_CODES.has(value);
}

const GENERIC_APP_ERROR_CODES = new Set<AppErrorCode>([
	AppErrorCode.BAD_REQUEST,
	AppErrorCode.UNAUTHORIZED,
	AppErrorCode.FORBIDDEN,
	AppErrorCode.NOT_FOUND,
	AppErrorCode.CONFLICT,
	AppErrorCode.VALIDATION_FAILED,
	AppErrorCode.TOO_MANY_REQUESTS,
	AppErrorCode.SERVICE_UNAVAILABLE,
	AppErrorCode.INTERNAL_ERROR,
]);

/**
 * Whether a code says nothing about what actually went wrong beyond its HTTP status.
 *
 * The web app prefers a message written for the specific call ("Could not cancel the
 * booking") over a generic one ("Something went wrong"), but never over a domain code,
 * which is always the more precise of the two.
 */
export function isGenericAppErrorCode(code: AppErrorCode): boolean {
	return GENERIC_APP_ERROR_CODES.has(code);
}

/**
 * Fallback code for errors that carry no code of their own — exceptions not yet migrated
 * to a domain code, or responses that never reached the API (a proxy or gateway error).
 *
 * Shared so the API and the web app cannot drift apart on what a given status means.
 */
export function appErrorCodeForStatus(status: number | undefined): AppErrorCode {
	switch (status) {
		case 400:
			return AppErrorCode.BAD_REQUEST;
		case 401:
			return AppErrorCode.UNAUTHORIZED;
		case 403:
			return AppErrorCode.FORBIDDEN;
		case 404:
			return AppErrorCode.NOT_FOUND;
		case 409:
			return AppErrorCode.CONFLICT;
		case 429:
			return AppErrorCode.TOO_MANY_REQUESTS;
		case 503:
			return AppErrorCode.SERVICE_UNAVAILABLE;
		default:
			return AppErrorCode.INTERNAL_ERROR;
	}
}
