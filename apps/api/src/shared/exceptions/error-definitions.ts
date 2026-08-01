import { HttpStatus } from '@nestjs/common';
import { AppErrorCode } from '@event-space/shared';

interface ErrorDefinition {
	status: HttpStatus;
	/**
	 * English text for logs, Swagger and debugging. The user never sees it — the web app
	 * translates the code instead — so wording here can change freely.
	 */
	message: string;
}

/**
 * The single source of HTTP status and English text per error code, so the same code can
 * never be thrown with two different statuses from two different call sites.
 */
export const ERROR_DEFINITIONS: Record<AppErrorCode, ErrorDefinition> = {
	[AppErrorCode.BAD_REQUEST]: { status: HttpStatus.BAD_REQUEST, message: 'Bad request' },
	[AppErrorCode.UNAUTHORIZED]: { status: HttpStatus.UNAUTHORIZED, message: 'Unauthorized' },
	[AppErrorCode.FORBIDDEN]: { status: HttpStatus.FORBIDDEN, message: 'Forbidden' },
	[AppErrorCode.NOT_FOUND]: { status: HttpStatus.NOT_FOUND, message: 'Not found' },
	[AppErrorCode.CONFLICT]: { status: HttpStatus.CONFLICT, message: 'Conflict' },
	[AppErrorCode.VALIDATION_FAILED]: { status: HttpStatus.BAD_REQUEST, message: 'Validation failed' },
	[AppErrorCode.TOO_MANY_REQUESTS]: {
		status: HttpStatus.TOO_MANY_REQUESTS,
		message: 'Too many requests. Please try again later.',
	},
	[AppErrorCode.SERVICE_UNAVAILABLE]: {
		status: HttpStatus.SERVICE_UNAVAILABLE,
		message: 'Service unavailable',
	},
	[AppErrorCode.INTERNAL_ERROR]: {
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		message: 'Internal server error',
	},

	[AppErrorCode.EMAIL_ALREADY_EXISTS]: {
		status: HttpStatus.CONFLICT,
		message: 'User with this email already exists',
	},
	[AppErrorCode.INVALID_VERIFICATION_CODE]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'Invalid or expired verification code',
	},
	[AppErrorCode.EMAIL_NOT_VERIFIED]: {
		status: HttpStatus.FORBIDDEN,
		message: 'Please verify your email first',
	},

	[AppErrorCode.INVALID_CREDENTIALS]: {
		status: HttpStatus.UNAUTHORIZED,
		message: 'Invalid email or password',
	},
	[AppErrorCode.SOCIAL_LOGIN_REQUIRED]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'This account uses social login. Please log in with the associated provider (Google)',
	},
	[AppErrorCode.INVALID_RESET_CODE]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'Invalid or expired code',
	},

	[AppErrorCode.GOOGLE_AUTH_FAILED]: {
		status: HttpStatus.UNAUTHORIZED,
		message: 'Google authentication failed',
	},
	[AppErrorCode.GOOGLE_EMAIL_MISSING]: {
		status: HttpStatus.UNAUTHORIZED,
		message: 'Email not provided by Google',
	},
	[AppErrorCode.GOOGLE_EMAIL_NOT_VERIFIED]: {
		status: HttpStatus.UNAUTHORIZED,
		message: 'Google email is not verified',
	},

	[AppErrorCode.REFRESH_TOKEN_MISSING]: {
		status: HttpStatus.UNAUTHORIZED,
		message: 'Refresh token missing',
	},
	[AppErrorCode.REFRESH_TOKEN_EXPIRED]: {
		status: HttpStatus.FORBIDDEN,
		message: 'Refresh token expired',
	},
	[AppErrorCode.REFRESH_TOKEN_REUSED]: {
		status: HttpStatus.FORBIDDEN,
		message: 'Refresh token already used',
	},
	[AppErrorCode.INVALID_TOKEN_FORMAT]: {
		status: HttpStatus.UNAUTHORIZED,
		message: 'Invalid token format',
	},
	[AppErrorCode.ACCESS_DENIED]: { status: HttpStatus.FORBIDDEN, message: 'Access denied' },
	[AppErrorCode.INSUFFICIENT_PERMISSIONS]: {
		status: HttpStatus.FORBIDDEN,
		message: 'You do not have permission to access this resource',
	},

	[AppErrorCode.OCCURRENCE_HAS_BOOKINGS]: {
		status: HttpStatus.CONFLICT,
		message: 'Occurrence has active bookings, cancel it instead of deleting',
	},
	[AppErrorCode.OCCURRENCES_HAVE_BOOKINGS]: {
		status: HttpStatus.CONFLICT,
		message:
			'One or more occurrences being removed have active bookings, cancel them explicitly first',
	},
	[AppErrorCode.EVENT_HAS_BOOKINGS]: {
		status: HttpStatus.CONFLICT,
		message: 'Event has active bookings, cancel it instead of deleting',
	},

	[AppErrorCode.OTP_RESEND_COOLDOWN]: {
		status: HttpStatus.FORBIDDEN,
		message: 'Please wait before requesting a new code',
	},
	[AppErrorCode.TOO_MANY_ATTEMPTS_FROM_DEVICE]: {
		status: HttpStatus.FORBIDDEN,
		message: 'Too many attempts from this device, access blocked. Try again later.',
	},
	[AppErrorCode.ACCOUNT_UNDER_PROTECTION]: {
		status: HttpStatus.FORBIDDEN,
		message: 'This account is under global protection. Try again later.',
	},

	[AppErrorCode.OCCURRENCE_NOT_FOUND]: { status: HttpStatus.NOT_FOUND, message: 'Occurrence not found' },
	[AppErrorCode.EVENT_NOT_FOUND]: { status: HttpStatus.NOT_FOUND, message: 'Event not found' },
	[AppErrorCode.BOOKING_NOT_FOUND]: { status: HttpStatus.NOT_FOUND, message: 'Booking not found' },
	[AppErrorCode.CATEGORY_NOT_FOUND]: { status: HttpStatus.NOT_FOUND, message: 'Category not found' },
	[AppErrorCode.USER_NOT_FOUND]: { status: HttpStatus.NOT_FOUND, message: 'User not found' },
	[AppErrorCode.CURRENT_USER_NOT_FOUND]: {
		status: HttpStatus.UNAUTHORIZED,
		message: 'User not found',
	},

	[AppErrorCode.EVENT_NOT_AVAILABLE_FOR_BOOKING]: {
		status: HttpStatus.FORBIDDEN,
		message: 'Event is not available for booking',
	},
	[AppErrorCode.ALREADY_BOOKED]: { status: HttpStatus.CONFLICT, message: 'Already booked' },
	[AppErrorCode.NO_SPOTS_AVAILABLE]: { status: HttpStatus.CONFLICT, message: 'No spots available' },
	[AppErrorCode.NOT_ENOUGH_SPOTS]: {
		status: HttpStatus.CONFLICT,
		message: 'Only {spotsLeft} spot(s) available',
	},
	[AppErrorCode.BOOKING_USER_OR_NAME_REQUIRED]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'userId or name is required',
	},
	[AppErrorCode.NOT_YOUR_BOOKING]: { status: HttpStatus.FORBIDDEN, message: 'Not your booking' },
	[AppErrorCode.PAYMENT_SERVICE_UNAVAILABLE]: {
		status: HttpStatus.SERVICE_UNAVAILABLE,
		message: 'Payment service is unavailable. Check your internet connection and try again.',
	},
	[AppErrorCode.BOOKING_ALREADY_CANCELLED]: {
		status: HttpStatus.CONFLICT,
		message: 'Cannot update a cancelled booking',
	},
	[AppErrorCode.UNABLE_TO_RELEASE_SPOTS]: {
		status: HttpStatus.CONFLICT,
		message: 'Unable to release spots',
	},
	[AppErrorCode.BOOKING_NOT_CONFIRMED]: {
		status: HttpStatus.CONFLICT,
		message: 'Booking is not confirmed',
	},
	[AppErrorCode.ALREADY_CHECKED_IN]: { status: HttpStatus.CONFLICT, message: 'Already checked in' },
	[AppErrorCode.INVALID_REFERENCE_NUMBER]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'Invalid reference number',
	},
	[AppErrorCode.BOOKING_NO_PAYMENT_INTENT]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'Booking has no payment intent to reconcile',
	},

	[AppErrorCode.OCCURRENCE_IN_PAST]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'Cannot create an occurrence in the past',
	},
	[AppErrorCode.IMAGE_NOT_IN_EVENT]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'Image {id} does not belong to this event',
	},
	[AppErrorCode.DUPLICATE_IMAGE_IDS]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'Duplicate existing image ids in payload',
	},
	[AppErrorCode.INVALID_STATUS_TRANSITION]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'Cannot change status from {from} to {to}',
	},
	[AppErrorCode.IMAGES_REQUIRED]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'payload.images is required',
	},
	[AppErrorCode.PAYLOAD_REQUIRED]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'payload field is required',
	},
	[AppErrorCode.INVALID_JSON_PAYLOAD]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'payload must be valid JSON',
	},
	[AppErrorCode.DUPLICATE_IMAGE_ORDERS]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'Image orders must be unique',
	},
	[AppErrorCode.NON_CONTIGUOUS_IMAGE_ORDERS]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'Image orders must be contiguous starting from 0',
	},
	[AppErrorCode.FILE_COUNT_MISMATCH]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'Expected {expected} file(s), received {received}',
	},
	[AppErrorCode.TOO_MANY_IMAGES]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'Maximum {max} images allowed',
	},

	[AppErrorCode.IMAGE_FILE_EMPTY]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'File {filename} is empty or unreadable',
	},
	[AppErrorCode.IMAGE_FILE_TOO_LARGE]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'File {filename} exceeds the size limit',
	},
	[AppErrorCode.IMAGE_FILE_INVALID_TYPE]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'File {filename} must be a valid png, jpeg, jpg, webp, or avif image',
	},
	[AppErrorCode.IMAGE_FILE_NOT_AN_IMAGE]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'File {filename} is not a valid image',
	},
	[AppErrorCode.IMAGE_FILE_EXTENSION_MISMATCH]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'File {filename} extension does not match its content',
	},

	[AppErrorCode.NO_FILE_PROVIDED]: { status: HttpStatus.BAD_REQUEST, message: 'No file provided' },
	[AppErrorCode.FILE_BUFFER_EMPTY]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'File buffer is empty',
	},
	[AppErrorCode.PUBLIC_ID_REQUIRED]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'publicId is required',
	},
	[AppErrorCode.UPLOAD_FAILED]: { status: HttpStatus.BAD_REQUEST, message: 'Upload failed' },

	[AppErrorCode.INVALID_QUERY_PARAM]: {
		status: HttpStatus.BAD_REQUEST,
		message: '{field} must be a valid number',
	},
	[AppErrorCode.INVALID_WEBHOOK_SIGNATURE]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'Invalid webhook signature',
	},
	[AppErrorCode.INVALID_WEBHOOK_REQUEST]: {
		status: HttpStatus.BAD_REQUEST,
		message: 'Invalid webhook request',
	},
	[AppErrorCode.EMAIL_SEND_FAILED]: {
		status: HttpStatus.SERVICE_UNAVAILABLE,
		message: 'Failed to send email',
	},
};
