import { Event, Booking, BookingWithDetails, SafeUserData, Category, EventOccurrence } from '@event-space/shared';
import type { ReactNode } from 'react';
import type { ModalSize } from '@/components/ui/Modal/Modal.types';

export enum ContactType {
	Instagram = 'instagram',
	Phone = 'phone',
	Email = 'email',
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
	UpdateBooking = 'update-booking',
	CreateManualBooking = 'create-manual-booking',
	BookingDetails = 'booking-details',
	BookingAction = 'booking-action',
	UserDetails = 'user-details',
	EventDetails = 'event-details',
	CreateEvent = 'create-event',
	UpdateEvent = 'update-event',
	ContactInfo = 'contact-info',
	CreateCategory = 'create-category',
	UpdateCategory = 'update-category',
	CategoryDetails = 'category-details',
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
}

export interface UpdateBookingModalData {
	booking: Booking & { event?: Event };
}

export interface BookingDetailsModalData {
	booking: BookingWithDetails;
}

export interface UserDetailsModalData {
	user: SafeUserData;
}

export interface EventDetailsModalData {
	event: Event;
}

export interface UpdateEventModalData {
	event: Event;
}

export interface CreateCategoryModalData {
	// Can be empty
}

export interface UpdateCategoryModalData {
	category: Category;
}

export interface CategoryDetailsModalData {
	category: Category;
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
	[ModalType.UpdateBooking]: UpdateBookingModalData;
	[ModalType.CreateManualBooking]: null;
	[ModalType.BookingDetails]: BookingDetailsModalData;
	[ModalType.BookingAction]: BookingDetailsModalData;
	[ModalType.UserDetails]: UserDetailsModalData;
	[ModalType.EventDetails]: EventDetailsModalData;
	[ModalType.CreateEvent]: null;
	[ModalType.UpdateEvent]: UpdateEventModalData;
	[ModalType.ContactInfo]: ContactInfoModalData;
	[ModalType.CreateCategory]: null;
	[ModalType.UpdateCategory]: UpdateCategoryModalData;
	[ModalType.CategoryDetails]: CategoryDetailsModalData;
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
