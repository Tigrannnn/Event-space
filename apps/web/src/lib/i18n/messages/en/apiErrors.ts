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
	[AppErrorCode.ACCOUNT_NEEDS_REGISTRATION]:
		'This email already has bookings but no account yet. Sign up and they will be waiting inside.',
	[AppErrorCode.CANNOT_CHANGE_OWN_ROLE]: 'You cannot change your own role — ask another admin.',
	[AppErrorCode.CANNOT_PROMOTE_UNVERIFIED]:
		'Only an account with a confirmed email can be made an admin.',
	[AppErrorCode.USER_NOT_SHADOW]:
		'Only a guest profile created by an admin can be edited here. This person has their own account.',
	[AppErrorCode.OCCURRENCE_DATE_LOCKED]:
		'This date has active bookings, so the event form cannot change it. Use the reschedule action instead.',
	[AppErrorCode.OCCURRENCE_DATE_TAKEN]: 'This event already has another date at that time.',
	[AppErrorCode.OCCURRENCE_CANCELLED]: 'A cancelled date cannot be moved.',
	[AppErrorCode.OCCURRENCE_CHANGED_CONCURRENTLY]:
		'The date changed while you were moving it. Refresh the page and try again.',
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
	[AppErrorCode.BANNER_NOT_FOUND]: 'This banner could not be found.',
	[AppErrorCode.REVIEW_NOT_FOUND]: 'This review could not be found.',
	[AppErrorCode.REVIEW_TOO_EARLY]: 'You can rate the tour once it has finished.',
	[AppErrorCode.REVIEW_WINDOW_CLOSED]: 'The time for reviewing this tour has passed.',
	[AppErrorCode.REVIEW_NOT_ELIGIBLE]: 'Only a paid booking for a tour that took place can be reviewed.',
	[AppErrorCode.REVIEW_ALREADY_EXISTS]: 'You have already reviewed this tour.',
	[AppErrorCode.REVIEW_EDIT_WINDOW_CLOSED]: 'A review can only be changed within two days of writing it.',
	[AppErrorCode.BANNER_IMAGE_REQUIRED]: 'Add a picture for the banner.',
	[AppErrorCode.BANNER_TARGET_REQUIRED]: 'Choose where the banner should lead.',
	[AppErrorCode.BANNER_INVALID_SCHEDULE]: 'The end date cannot be earlier than the start date.',
	[AppErrorCode.TOO_MANY_ACTIVE_BANNERS]: 'At most {max} banners can be shown at once.',
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
	[AppErrorCode.BOOKING_NOT_PENDING]: 'Only a pending booking can be confirmed by hand.',
	[AppErrorCode.QUANTITY_PAYMENT_REQUIRED]: 'Adding guests has to be paid for first.',
	[AppErrorCode.QUANTITY_INCREASE_NOT_ALLOWED]: 'An admin cannot add guests to a booking. Make a new booking instead.',
	[AppErrorCode.QUANTITY_UNCHANGED]: 'The number of guests has not changed.',
	[AppErrorCode.QUANTITY_QUOTE_CHANGED]: 'The refund amount changed since you saw it. Please check the new amount.',
	[AppErrorCode.QUANTITY_SETTLEMENT_INVALID]: 'This way of settling does not fit the change.',
	[AppErrorCode.BOOKING_CHANGED_CONCURRENTLY]: 'The booking was just changed. Please refresh the page.',
	[AppErrorCode.PAYMENT_ALREADY_RECEIVED]: 'A card payment for this booking is already in progress or received. Please refresh the page.',
	[AppErrorCode.ALREADY_CHECKED_IN]: 'This booking is already checked in.',
	[AppErrorCode.NOT_CHECKED_IN]: 'This booking is not checked in.',
	[AppErrorCode.TOUR_ALREADY_STARTED]: 'The tour has already started, so the booking can no longer be cancelled. Please contact the organiser.',
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
