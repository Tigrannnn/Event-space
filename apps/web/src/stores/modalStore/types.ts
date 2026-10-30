import {
	Banner,
	Event,
	Booking,
	BookingWithDetails,
	BookingWithEstimate,
	SafeUserData,
	Category,
	EventOccurrence,
	PromoCode,
} from '@event-space/shared';
import type { ReactNode } from 'react';
import type { ModalSize } from '@/components/ui/Modal/Modal.types';

export enum ContactType {
	Instagram = 'instagram',
	Phone = 'phone',
	Email = 'email',
	Location = 'location',
}

export enum ModalType {
	Register = 'register',
	Login = 'login',
	VerifyEmail = 'verify-email',
	ForgotPassword = 'forgot-password',
	ImagePreview = 'image-preview',
	Confirm = 'confirm',
	EditProfile = 'edit-profile',
	CreateBooking = 'create-booking',
	BookingSuccess = 'booking-success',
	UpdateBooking = 'update-booking',
	CreateManualBooking = 'create-manual-booking',
	BookingDetails = 'booking-details',
	BookingCancel = 'booking-cancel',
	BookingConfirm = 'booking-confirm',
	ChangeQuantity = 'change-quantity',
	UserDetails = 'user-details',
	EditGuest = 'edit-guest',
	ChangeEmail = 'change-email',
	BookingQrCode = 'booking-qr-code',
	EventDetails = 'event-details',
	CreateEvent = 'create-event',
	UpdateEvent = 'update-event',
	ContactInfo = 'contact-info',
	CreateCategory = 'create-category',
	UpdateCategory = 'update-category',
	CategoryDetails = 'category-details',
	CreateBanner = 'create-banner',
	UpdateBanner = 'update-banner',
	CreatePromoCode = 'create-promo-code',
	UpdatePromoCode = 'update-promo-code',
	CompensateBooking = 'compensate-booking',
	TransferBooking = 'transfer-booking',
}

export interface ContactInfoModalData {
	type: ContactType;
	value: string;
}

export interface ImagePreviewData {
	images: string[];
	initialIndex?: number;
}

export interface VerifyEmailModalData {
	email: string;
}

export interface ForgotPasswordModalData {
	email?: string;
	/**
	 * `signIn`: the code lets the person in and a new password is optional.
	 * `changePassword`: opened from the profile, the new password is the point of it.
	 */
	mode?: 'signIn' | 'changePassword';
}

export interface ConfirmModalData {
	title: string;
	message: ReactNode;
	size?: ModalSize;
	confirmText?: string;
	cancelText?: string;
	variant?: 'danger' | 'primary';
	onConfirm: () => void;
	onCancel?: () => void;
}

export interface CreateBookingModalData {
	event: Event;
	selectedOccurrence?: EventOccurrence;
	initialQuantity?: number;
}

export interface BookingSuccessModalData {
	booking: Booking;
	event: Event;
	occurrence: EventOccurrence | null;
	/** Set for a booking made without an account: the key to its page and where the link went. */
	accessToken?: string;
	guestEmail?: string;
}

export interface UpdateBookingModalData {
	booking: Booking & { event?: Event };
}

export interface ChangeQuantityModalData {
	booking: BookingWithEstimate;
	/** The link from the booking's email, when the guest has no account to sign in with. */
	accessToken?: string;
}

export interface BookingDetailsModalData {
	booking: BookingWithDetails;
}

export interface UserDetailsModalData {
	user: SafeUserData;
}

export interface EditGuestModalData {
	user: SafeUserData;
}

export interface BookingQrCodeModalData {
	checkinToken: string;
	referenceNumber: number | null;
}

export interface EventDetailsModalData {
	event: Event;
}

export interface UpdateEventModalData {
	event: Event;
}

export interface UpdateCategoryModalData {
	category: Category;
}

export interface CategoryDetailsModalData {
	category: Category;
}

export interface UpdateBannerModalData {
	banner: Banner;
}

export interface UpdatePromoCodeModalData {
	promoCode: PromoCode;
}

export interface ModalDataMap {
	[ModalType.Register]: null;
	[ModalType.Login]: null;
	[ModalType.VerifyEmail]: VerifyEmailModalData;
	[ModalType.ForgotPassword]: ForgotPasswordModalData | null;
	[ModalType.ImagePreview]: ImagePreviewData;
	[ModalType.Confirm]: ConfirmModalData;
	[ModalType.EditProfile]: null;
	[ModalType.CreateBooking]: CreateBookingModalData;
	[ModalType.BookingSuccess]: BookingSuccessModalData;
	[ModalType.UpdateBooking]: UpdateBookingModalData;
	[ModalType.CreateManualBooking]: null;
	[ModalType.BookingDetails]: BookingDetailsModalData;
	[ModalType.BookingCancel]: BookingDetailsModalData;
	[ModalType.BookingConfirm]: BookingDetailsModalData;
	[ModalType.ChangeQuantity]: ChangeQuantityModalData;
	[ModalType.UserDetails]: UserDetailsModalData;
	[ModalType.EditGuest]: EditGuestModalData;
	[ModalType.ChangeEmail]: null;
	[ModalType.BookingQrCode]: BookingQrCodeModalData;
	[ModalType.EventDetails]: EventDetailsModalData;
	[ModalType.CreateEvent]: null;
	[ModalType.UpdateEvent]: UpdateEventModalData;
	[ModalType.ContactInfo]: ContactInfoModalData;
	[ModalType.CreateCategory]: null;
	[ModalType.UpdateCategory]: UpdateCategoryModalData;
	[ModalType.CategoryDetails]: CategoryDetailsModalData;
	[ModalType.CreateBanner]: null;
	[ModalType.UpdateBanner]: UpdateBannerModalData;
	[ModalType.CreatePromoCode]: null;
	[ModalType.UpdatePromoCode]: UpdatePromoCodeModalData;
	[ModalType.CompensateBooking]: BookingDetailsModalData;
	[ModalType.TransferBooking]: BookingDetailsModalData;
}

export interface ModalState {
	activeModal: ModalType | null;
	isExiting: boolean;
	modalData: ModalDataMap[keyof ModalDataMap] | null;
}

export interface ModalActions {
	openModal: <T extends ModalType>(
		...args: ModalDataMap[T] extends null ? [modalType: T] : [modalType: T, data: ModalDataMap[T]]
	) => void;
	closeModal: () => void;
	clearModalData: () => void;
}

export type ModalStore = ModalState & ModalActions;
