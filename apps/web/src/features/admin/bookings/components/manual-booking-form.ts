import {
	EmailSchema,
	MANUAL_BOOKING_AMOUNT_MAX,
	PhoneSchema,
	SYSTEM_CHANNEL_IDS,
	type CreateManualBookingData,
} from '@event-space/shared';
import type { MessageKey } from '@/lib/i18n/messages';

export type ManualBookingField =
	| 'event'
	| 'occurrence'
	| 'user'
	| 'phone'
	| 'email'
	| 'amount'
	| 'promoCode';
export type ManualBookingErrors = Partial<Record<ManualBookingField, MessageKey>>;

export interface ManualBookingDraft {
	eventId?: string;
	hasAvailableDates: boolean;
	occurrenceId: string;
	quantity: number;
	userId?: string;
	name?: string;
	phone?: string;
	email?: string;
	paymentMethod: CreateManualBookingData['paymentMethod'];
	locale?: CreateManualBookingData['locale'];
	channelId: string;
	externalId?: string | null;
	amount?: string;
	promoCode?: string;
}

/**
 * Checks the draft field by field against the same rules as the API's CreateManualBookingSchema,
 * so each problem is shown under its own field rather than as one line at the bottom.
 */
export function validateManualBooking(draft: ManualBookingDraft): ManualBookingErrors {
	const errors: ManualBookingErrors = {};

	if (!draft.eventId) {
		errors.event = 'admin.validation.eventRequired';
	} else if (!draft.hasAvailableDates) {
		errors.occurrence = 'admin.validation.noAvailableDates';
	} else if (!draft.occurrenceId) {
		errors.occurrence = 'admin.validation.dateRequired';
	}

	const newUserName = draft.name?.trim();
	if (!draft.userId && !newUserName) {
		errors.user = 'admin.validation.userRequired';
	}

	// Contact details only matter once a new user is being created — not while nothing has been
	// chosen yet, and not for an existing user, who is sent by id.
	if (!draft.userId && newUserName) {
		const phone = draft.phone?.trim();
		if (!phone) {
			errors.phone = 'admin.enterPhoneForShadowUser';
		} else if (!PhoneSchema.safeParse(phone).success) {
			errors.phone = 'admin.validation.invalidPhone';
		}

		const email = draft.email?.trim();
		if (email && !EmailSchema.safeParse(email).success) {
			errors.email = 'admin.validation.invalidEmail';
		}
	}

	const amount = parseAmount(draft.amount);
	if (amount !== undefined && (Number.isNaN(amount) || amount < 0 || amount > MANUAL_BOOKING_AMOUNT_MAX)) {
		errors.amount = 'admin.validation.invalidAmount';
	}

	if (draft.promoCode?.trim() && amount !== undefined) {
		errors.promoCode = 'admin.validation.promoCodeWithAmount';
	}

	return errors;
}

function parseAmount(value: string | undefined): number | undefined {
	const text = value?.trim().replace(',', '.');
	return text ? Number(text) : undefined;
}

/**
 * The request for a validated draft. An existing user goes by id alone: the API rejects a
 * request carrying both an id and a name, and reads an email as a new account — which would
 * clash with the user's own address.
 */
export function buildManualBookingData(draft: ManualBookingDraft): CreateManualBookingData {
	const base = {
		occurrenceId: draft.occurrenceId,
		quantity: draft.quantity,
		paymentMethod: draft.paymentMethod,
		locale: draft.locale,
		channelId: draft.channelId,
		// A number only means something on a platform; with no channel named there is none.
		externalId: draft.channelId === SYSTEM_CHANNEL_IDS.UNSPECIFIED ? null : draft.externalId?.trim() || null,
		amount: parseAmount(draft.amount),
		promoCode: draft.promoCode?.trim() || undefined,
	};

	if (draft.userId) {
		return { ...base, userId: draft.userId };
	}

	return {
		...base,
		name: draft.name?.trim(),
		phone: draft.phone?.trim(),
		email: draft.email?.trim() || undefined,
	};
}
