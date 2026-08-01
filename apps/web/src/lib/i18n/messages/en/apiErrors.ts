import { AppErrorCode } from '@event-space/shared';

/**
 * User-facing text for every error the API can return, keyed by its code.
 *
 * Typed as a total record, so adding a code to `AppErrorCode` breaks the build until all
 * three locales have a message for it. Wording is deliberately not a translation of the
 * API's internal English message — that one is written for logs, this one for users.
 */
export const apiErrors: Record<AppErrorCode, string> = {
	[AppErrorCode.BAD_REQUEST]: 'The request could not be processed. Please check your input.',
	[AppErrorCode.UNAUTHORIZED]: 'Please sign in to continue.',
	[AppErrorCode.FORBIDDEN]: 'You do not have access to this action.',
	[AppErrorCode.NOT_FOUND]: 'We could not find what you were looking for.',
	[AppErrorCode.CONFLICT]: 'This action conflicts with the current state. Please refresh and retry.',
	[AppErrorCode.VALIDATION_FAILED]: 'Please check the highlighted fields.',
	[AppErrorCode.TOO_MANY_REQUESTS]: 'Too many requests. Please try again in a moment.',
	[AppErrorCode.SERVICE_UNAVAILABLE]: 'The service is temporarily unavailable. Please try again.',
	[AppErrorCode.INTERNAL_ERROR]: 'Something went wrong. Please try again.',

	[AppErrorCode.EMAIL_ALREADY_EXISTS]: 'An account with this email already exists.',
	[AppErrorCode.INVALID_VERIFICATION_CODE]: 'This verification code is invalid or has expired.',
	[AppErrorCode.EMAIL_NOT_VERIFIED]: 'Please verify your email address first.',

	[AppErrorCode.INVALID_CREDENTIALS]: 'Incorrect email or password.',
	[AppErrorCode.SOCIAL_LOGIN_REQUIRED]: 'This account uses Google sign-in. Please continue with Google.',
	[AppErrorCode.INVALID_RESET_CODE]: 'This code is invalid or has expired.',

	[AppErrorCode.GOOGLE_AUTH_FAILED]: 'Google sign-in failed. Please try again.',
	[AppErrorCode.GOOGLE_EMAIL_MISSING]: 'Google did not provide an email address.',
	[AppErrorCode.GOOGLE_EMAIL_NOT_VERIFIED]: 'This Google account has no verified email address.',

	[AppErrorCode.REFRESH_TOKEN_MISSING]: 'Your session has ended. Please sign in again.',
	[AppErrorCode.REFRESH_TOKEN_EXPIRED]: 'Your session has expired. Please sign in again.',
	[AppErrorCode.REFRESH_TOKEN_REUSED]: 'Your session is no longer valid. Please sign in again.',
	[AppErrorCode.INVALID_TOKEN_FORMAT]: 'Your session is no longer valid. Please sign in again.',
	[AppErrorCode.ACCESS_DENIED]: 'Access denied. Please sign in again.',
	[AppErrorCode.INSUFFICIENT_PERMISSIONS]: 'You do not have permission to do this.',

	[AppErrorCode.OCCURRENCE_HAS_BOOKINGS]:
		'This date has active bookings. Cancel it instead of deleting it.',
	[AppErrorCode.OCCURRENCES_HAVE_BOOKINGS]:
		'Some of the dates you are removing have active bookings. Cancel those bookings first.',
	[AppErrorCode.EVENT_HAS_BOOKINGS]:
		'This event has active bookings. Cancel it instead of deleting it.',

	[AppErrorCode.OTP_RESEND_COOLDOWN]: 'Please wait before requesting a new code.',
	[AppErrorCode.TOO_MANY_ATTEMPTS_FROM_DEVICE]:
		'Too many attempts from this device. Please try again later.',
	[AppErrorCode.ACCOUNT_UNDER_PROTECTION]:
		'This account is temporarily protected after repeated attempts. Please try again later.',

	[AppErrorCode.OCCURRENCE_NOT_FOUND]: 'This date could not be found.',
	[AppErrorCode.EVENT_NOT_FOUND]: 'This event could not be found.',
	[AppErrorCode.BOOKING_NOT_FOUND]: 'This booking could not be found.',
	[AppErrorCode.CATEGORY_NOT_FOUND]: 'This category could not be found.',
	[AppErrorCode.USER_NOT_FOUND]: 'This user could not be found.',
	[AppErrorCode.CURRENT_USER_NOT_FOUND]: 'Your account could not be found. Please sign in again.',

	[AppErrorCode.EVENT_NOT_AVAILABLE_FOR_BOOKING]: 'This event is not available for booking.',
	[AppErrorCode.ALREADY_BOOKED]: 'You already have a booking for this date.',
	[AppErrorCode.NO_SPOTS_AVAILABLE]: 'No spots are left for this date.',
	[AppErrorCode.NOT_ENOUGH_SPOTS]: 'Only {spotsLeft} spot(s) left for this date.',
	[AppErrorCode.BOOKING_USER_OR_NAME_REQUIRED]: 'Provide either a user or a name for the booking.',
	[AppErrorCode.NOT_YOUR_BOOKING]: 'This booking does not belong to you.',
	[AppErrorCode.PAYMENT_SERVICE_UNAVAILABLE]:
		'The payment service is unavailable. Check your connection and try again.',
	[AppErrorCode.BOOKING_ALREADY_CANCELLED]: 'This booking is already cancelled.',
	[AppErrorCode.UNABLE_TO_RELEASE_SPOTS]: 'Could not release the spots for this booking.',
	[AppErrorCode.BOOKING_NOT_CONFIRMED]: 'This booking is not confirmed yet.',
	[AppErrorCode.ALREADY_CHECKED_IN]: 'This booking is already checked in.',
	[AppErrorCode.INVALID_REFERENCE_NUMBER]: 'This is not a valid booking reference.',
	[AppErrorCode.BOOKING_NO_PAYMENT_INTENT]: 'This booking has no payment to reconcile.',

	[AppErrorCode.OCCURRENCE_IN_PAST]: 'You cannot add a date in the past.',
	[AppErrorCode.IMAGE_NOT_IN_EVENT]: 'One of the images does not belong to this event.',
	[AppErrorCode.DUPLICATE_IMAGE_IDS]: 'The same image was referenced more than once.',
	[AppErrorCode.INVALID_STATUS_TRANSITION]: 'This status change is not allowed.',
	[AppErrorCode.IMAGES_REQUIRED]: 'At least the image list is required.',
	[AppErrorCode.PAYLOAD_REQUIRED]: 'The request is missing required data.',
	[AppErrorCode.INVALID_JSON_PAYLOAD]: 'The request data is malformed.',
	[AppErrorCode.DUPLICATE_IMAGE_ORDERS]: 'Image order must be unique for each image.',
	[AppErrorCode.NON_CONTIGUOUS_IMAGE_ORDERS]: 'Image order must run from 0 without gaps.',
	[AppErrorCode.FILE_COUNT_MISMATCH]: 'The number of uploaded files does not match the images.',
	[AppErrorCode.TOO_MANY_IMAGES]: 'Too many images were uploaded.',

	[AppErrorCode.IMAGE_FILE_EMPTY]: 'One of the files is empty or could not be read.',
	[AppErrorCode.IMAGE_FILE_TOO_LARGE]: 'One of the files is too large.',
	[AppErrorCode.IMAGE_FILE_INVALID_TYPE]: 'Images must be png, jpeg, webp, or avif.',
	[AppErrorCode.IMAGE_FILE_NOT_AN_IMAGE]: 'One of the files is not a valid image.',
	[AppErrorCode.IMAGE_FILE_EXTENSION_MISMATCH]: "One of the files' extensions doesn't match its content.",

	[AppErrorCode.NO_FILE_PROVIDED]: 'No file was provided.',
	[AppErrorCode.FILE_BUFFER_EMPTY]: 'The file appears to be empty.',
	[AppErrorCode.PUBLIC_ID_REQUIRED]: 'Missing file reference.',
	[AppErrorCode.UPLOAD_FAILED]: 'The upload failed. Please try again.',

	[AppErrorCode.INVALID_QUERY_PARAM]: 'One of the filters is invalid.',
	[AppErrorCode.INVALID_WEBHOOK_SIGNATURE]: 'Invalid webhook signature.',
	[AppErrorCode.INVALID_WEBHOOK_REQUEST]: 'Invalid webhook request.',
	[AppErrorCode.EMAIL_SEND_FAILED]: 'Could not send the email. Please try again.',
};
