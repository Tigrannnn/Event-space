import { Event, Booking, BookingWithDetails, SafeUserData } from '@event-space/shared';
import type { ReactNode } from 'react';
import type { ModalSize } from '@/components/ui/Modal/Modal.types';

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
	UserDetails = 'user-details',
	EventDetails = 'event-details',
	CreateEvent = 'create-event',
	UpdateEvent = 'update-event',
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
	[ModalType.UserDetails]: UserDetailsModalData;
	[ModalType.EventDetails]: EventDetailsModalData;
	[ModalType.CreateEvent]: null;
	[ModalType.UpdateEvent]: UpdateEventModalData;
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
